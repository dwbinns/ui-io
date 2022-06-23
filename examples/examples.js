import { Data, value, html } from "ui-io";

const { iframe } = html(document);


for (let section of document.querySelectorAll("section")) {
    let explanation = section.querySelector("p");
    let codeEditor = section.querySelector("textarea");
    let code = new Data();
    value(code)(codeEditor);
    let iframeResults = iframe();
    code.observe(iframeResults, () => iframeResults.)
    section.append(iframe());

}


const { div, button, span } = html(document);

let counter = new Data(0);
let expanded = new Data(true);

document.body.append(
    div(
        div(
            button(
                on('click', () =>
                    expanded.set(!expanded.get())
                ),
                expanded.if("contract", "expand")
            )
        ),
        expanded.if(() =>
            div(
                button(
                    on('click', () =>
                        counter.set(counter.get() + 1)
                    ),
                    "increment"
                ),
                span(
                    style({
                        background: '#ddf',
                        padding: '10px',
                        borderRadius: '5px',
                    }),
                    "counter:",
                    counter.to(v => `#${v}`)
                )
            )
        ),
    )
);

