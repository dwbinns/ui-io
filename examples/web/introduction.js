import { HTML, Data } from "ui-io";

// attach to a document and get element factories:
const { h1, div } = HTML(document);

document.body.append(
    // create an h1 element, and add content to it:
    h1("Hello world!"),
    // Data tracks changes to an item of data:
    div(Data.periodic(Date, 1000)),
);