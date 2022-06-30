import { Data, HTML, value } from "ui-io";
const { input, div } = HTML(document);

const reverse = string => [...string].reverse().join(""); 

// Data represents a changing data point and this variable
// is named with a $ suffix to distinguish it from a value
const text$ = new Data("hello");
// Transform data in both directions:
const reverse$ = text$.to(reverse, reverse);
document.body.append(
    div(
        // value connects the input to the data
        input(value(text$)),
        " <=> ",
        input(value(reverse$)),
    )
);
