import { Data, attr, SVG, style } from "ui-io";
const { svg, path } = SVG(document);

const { PI, sin, cos } = Math;

function coords(fraction, length) {
    let angle = fraction * PI * 2;
    return [50 + length * sin(angle), 50 - length * cos(angle)];
}

function hand(position$, length, strokeWidth) {
    return path(
        attr({
            d: position$
                .to(fraction => `M ${coords(fraction, -length * 0.2)} L ${coords(fraction, length)}`),
        }),
        style({
            stroke: "#000",
            strokeWidth: strokeWidth,
            strokeLinecap: 'round',
        })
    );
}

let getTime = () => {
    let date = new Date();
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() * 1;
};

let time$ = Data.periodic(getTime, 1000);

let secondHand$ = time$.to(time => time / 60);
let minuteHand$ = secondHand$.to(time => time / 60);
let hourHand$ = minuteHand$.to(time => time / 12);

document.body.append(
    svg(
        attr({ viewBox: "0 0 100 100" }),
        hand(hourHand$, 20, 3),
        hand(minuteHand$, 27, 2),
        hand(secondHand$, 32, 1),
    )
);