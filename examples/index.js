import { html as langHtml } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { classList, Data, HTML, on, style } from "ui-io";
import { locationHashData } from "../browser";

const { iframe, div, ul, li, pre } = HTML(document);

const version = process.env.VERSION; // from webpack

function editor(code$, language) {
    let codeEditor = div();

    let editor;

    code$.observe(codeEditor, v => {
        editor ||= new EditorView({
            state: EditorState.create({
                doc: v,
                extensions: [
                    basicSetup,
                    language(),
                    EditorView.updateListener.of(() => code$.set(editor.state.doc.toString())),
                    indentUnit.of("    "),
                ]
            }),
            parent: codeEditor,
        });
    });

    return codeEditor;
}

let tabs = [];

let selectedId$ = locationHashData();

let examples = new Map();

let firstId = null;

for (let article of document.querySelectorAll("article")) {
    let title = article.querySelector("h1");
    let explanation = article.querySelector("section");

    let srcJs = article.querySelector("a.script").href;
    let srcHtml = article.querySelector("a.html")?.href || "./blank.html";
    let id = article.id;

    let code$ = new Data(fetch(srcJs).then(response => response.text())).asyncResult();
    let doc$ = new Data(fetch(srcHtml).then(response => response.text())).asyncResult();

    let error$ = new Data();

    let results = iframe(style({display: error$.if('none', 'block')}));
    
    Data.from(doc$, code$, (doc, code) => [doc, code]).observe(results, ([doc, code]) => {
        error$.set(null);
        results.setAttribute("srcdoc", doc);
        results.onload = () => {
            let scriptElement = results.contentDocument.createElement("script");
            scriptElement.type = "module";
            results.contentWindow.addEventListener("error", event => error$.set(event.error.stack));
            let replacedCode = code.replace(/(import.*)from ["']ui-io["']/, '$1from "./dist/ui-io.js"');
            console.log(replacedCode);
            scriptElement.append(replacedCode);
            results.contentDocument.body.append(scriptElement);
        };
    });

    let htmlEditor = editor(doc$, langHtml);

    let jsEditor = editor(code$, javascript);

    article.replaceChildren(
        div(
            classList("playground"),
            div(
                explanation, 
                jsEditor
            ),
            div(
                htmlEditor, 
                div(
                    classList("results"),
                    results, 
                    pre(style({display: error$.if('block', 'none')}), error$)
                )
            )
        )
    );

    const select = () => selectedId$.set(id);

    if (!tabs.length) firstId = id;

    tabs.push(li(
        on('click', select),
        title.innerText,
        classList(selectedId$.to(v => v == id ? "selected" : "x"))
    ));

    examples.set(id, article);

    title.remove();
    article.remove();
}

if (!examples.get(selectedId$.get())) {
    selectedId$.set(firstId);
}

document.body.append(ul(...tabs), div(classList('tab-content'), selectedId$.to(id => examples.get(id))));

for (let versionElement of document.querySelectorAll(".version")) {
    versionElement.append(version);
}