import { Data, HTML, style, value, on } from "ui-io";
const { b, input, div, button } = HTML(document);

const shopping$ = new Data([
    { name: "tomatoes" },
    { name: "cheese" },
    { name: "milk" },
]);

function List(title, key) {
    let counter = 0;

    return div(style({ flexGrow: 1 }),
        b(title),
        shopping$.map({ key }, item$ =>
            div(
                ++counter,
                ' : ',
                input(
                    style({ width: '5em' }),
                    value(item$.field("name"))
                )
            )
        )
    );
}

document.body.append(
    div(style({ display: 'flex', flexDirection: 'row' }),
        on('keydown', ({ key }) => {
            if (key == "F1") shopping$.set([...shopping$.get()]);
            if (key == "F2") shopping$.set([...shopping$.get()].reverse());
            if (key == "F3") shopping$.set(JSON.parse(JSON.stringify(shopping$.get())));
        }),
        List("none"),
        List("field name", "name"),
        List("function: field", item => item.name),
        List("function: object", item => item),
        List("non-unique", "missing"),
    ),
);
