import { contentEditable, Data, HTML, style, textExtract } from "ui-io";
const { label, span } = HTML(document);

function reformat(text) {
    return [...text.replaceAll(/[^0-9]/g, '').matchAll(/.{1,4}/g)]
        .map(([part]) =>
            span(style({ paddingRight: '10px' }), part)
        );
}

const input$ = new Data("12345678");

// Data.forceUpdate will cause input$ to be updated (and hence reformat run) 
// even if the text has not changed
const formatted$ = input$.to(reformat, Data.forceUpdate(textExtract));

document.body.append(
    label(
        style({display: 'flex', alignItems: 'center', gap: '10px'}),
        "Enter your card number:",
        span(
            style({padding: '5px', flexGrow: 1, background: '#eee'}),
            contentEditable(formatted$)
        )
    ),
);
