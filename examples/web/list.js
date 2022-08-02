import { Data, HTML, value, on } from "ui-io";
const { input, div, button } = HTML(document);

const shopping$ = new Data([
    "tomatoes",
    "cheese",
    "milk"
]);

document.body.append(
    div(
        shopping$.map((item$, index$, { remove }) =>
            div(
                index$.to(index => index + 1), ': ',
                input(value(item$)),
                button(on('click', remove), "X"),
            )
        ),
        div(
            button(
                on('click', () => shopping$.append('')),
                "+"
            )
        )
    )
);
