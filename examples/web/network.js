import { Data, HTML, value, properties, style } from "ui-io";
const { div, input, a, label } = HTML(document);

const search$ = new Data("ui-io");

const searchResult$ = search$.debounce(500)
    .to(async searchText =>
        await (
            await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(searchText)}`)
        ).json()
    );

const results$ = searchResult$
    .asyncResult()
    .to(result =>
        result.objects.map(({ package: { name, version } }) =>
            div(
                a(
                    properties({
                        target: "_blank",
                        href: `https://www.npmjs.com/package/${encodeURIComponent(name)}`
                    }),
                    name,
                ),
                " - ",
                version
            )
        )
    );

document.body.append(
    div(label('Search NPM: ', input(value(search$)))),
    div(searchResult$.asyncStatus()),
    div(style({ display: 'flex', flexDirection: 'column' }),
        results$,
    ),
);