import { Data, drag, draggable, dragleave, drop, HTML, on, properties, style, value } from "ui-io";
const { input, div, button } = HTML(document);

const shopping$ = new Data([
    "tomatoes",
    "cheese",
    "milk",
    "detergent"
]);

const available$ = new Data([
    "eggs",
    "carrots",
]);


function listView(list$) {

    function setPlaceholder(index) {
        let list = list$.get().filter(v => v != null);
        if (index != undefined) {
            list.splice(index, 0, null);
        }
        list$.set(list);
    }

    return div(style({ display: 'flex', flexDirection: 'column', gap: '10px' }),
        div(
            dragleave(setPlaceholder),
            list$.map((item$, index$, { remove, insertBefore, insertAfter, replace }) =>
                item$.is(null).if(
                    div(
                        properties({ id: "dropzone" }),
                        style({ height: '32px', padding: '4px', border: '2px dashed #aaa' }),
                        drop("text/plain", replace),
                    ),
                    div(
                        style({ height: '32px', padding: '4px' }),
                        properties({ id: item$ }),
                        draggable(" ∷ "),
                        drag("text/plain", item$, remove, list$),
                        on('dragover', () => setPlaceholder(index$.get())),
                        input(value(item$)),
                        button(on('click', remove), "X"),
                    ),
                )
            ),
        ),


        button(
            on('dragover', () => setPlaceholder(list$.get().length)),
            on('click', () => list$.append('')),
            "+"
        )
    );
}


document.body.append(
    div(style({ display: 'flex', flexDirection: 'row', gap: '50px' }),
        listView(shopping$), listView(available$),
    )
);
