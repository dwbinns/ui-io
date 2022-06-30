
import { Data, on, HTML, style } from "ui-io";
const { button, div } = HTML(document);

const sections = [...document.querySelectorAll("article")];

const selectedTab = new Data(sections[0]);

const tabContainer = div(
    style({ borderBottom: "2px solid #000" }),
    sections.map(section =>
        button(
            style({
                background: selectedTab.is(section)
                    .to(selected =>
                        selected ? "#ccf" : "#fff"
                    ),
                border: 'none',
            }),
            on('click', () => selectedTab.set(section)),
            section.getAttribute("title")
        )
    )
);

document.body.replaceChildren(
    tabContainer, 
    div(selectedTab)
);
