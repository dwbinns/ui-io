import { html as langHtml } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { locationHashData, classList, Data, HTML, on, style } from "ui-io";

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

let articles = [...document.querySelectorAll("article")].map(article => {
    let title = article.querySelector("h1").innerText;
    let explanation = article.querySelector("section");

    let srcJs = article.querySelector("a.script").href;
    let srcHtml = article.querySelector("a.html")?.href || "./blank.html";
    let id = article.id;

    let code$ = new Data(fetch(srcJs).then(response => response.text())).asyncResult();
    let doc$ = new Data(fetch(srcHtml).then(response => response.text())).asyncResult();

    let error$ = new Data();

    let results = iframe(style({ display: error$.if('none', 'block') }));

    Data.from(doc$, code$, (doc, code) => [doc, code]).observe(results, ([doc, code]) => {
        if (!code || !doc) return;
        error$.set(null);
        results.setAttribute("srcdoc", doc);
        results.onload = () => {
            let scriptElement = results.contentDocument.createElement("script");
            scriptElement.type = "module";
            results.contentWindow.addEventListener("error", event => error$.set(event.error.stack));
            let replacedCode = code.replace(/(import.*)from ["']ui-io["']/, '$1from "./ui-io.js"');
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
                    pre(style({ display: error$.if('block', 'none') }), error$)
                )
            )
        )
    );

    article.remove();

    return { article, title, id };
});


let selectedId$ = locationHashData();

let menu = articles.map(({ title, id }) => li(
    on('click', () => selectedId$.set(id)),
    title,
    classList(selectedId$.to(v => v == id ? "selected" : "x"))
));


if (!articles.find(a => a.id == selectedId$.get())) {
    selectedId$.set(articles[0].id);
}

let prior$ = selectedId$.to(id => articles[articles.findIndex(a => a.id == id) - 1] || null);
let next$ = selectedId$.to(id => articles[articles.findIndex(a => a.id == id) + 1] || null);

let prior = prior$.if(div(
    on('click', () => selectedId$.set(prior$.get().id)),
    "< ",
    prior$.to(article => article?.title)
), div());

let next = next$.if(div(
    on('click', () => selectedId$.set(next$.get().id)),
    next$.to(article => article?.title),
    " >"
), div());


let menuOpen$ = new Data(false);
let menuTrigger = div(
    on('click', () => menuOpen$.toggle()),
    classList("menu-trigger"),
    "☰ ",
    selectedId$.to(id => articles.find(a => a.id == id)?.title)
);
let menuList = ul(
    style({ display: menuOpen$.if(null, "none") }),
    on('click', () => menuOpen$.toggle()),
    classList('menu'),
    menu
);

document.body.append(
    div(
        div(
            classList("menu-bar"),
            prior, menuTrigger, next
        ),
        menuList, selectedId$.to(id => articles.find(a => a.id == id)?.article))
);

for (let versionElement of document.querySelectorAll(".version")) {
    versionElement.append(version);
}