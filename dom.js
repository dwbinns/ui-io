import { Data } from "./Data.js";

const dynamic = Symbol('dynamic');
const terminal = Symbol('terminal');

function insertContent(parent, before, content) {
    if (content instanceof Array) {
        for (let item of content) {
            before = insertContent(parent, before, item);
        }
        return before;
    }
    if (content == null || content == undefined) return before;
    if (content.observe) {
        if (before?.[dynamic] == content) return before[terminal].nextSibling;
        let start = document.createTextNode("");
        let end = document.createTextNode("");
        start[dynamic] = content;
        start[terminal] = end;
        parent.insertBefore(start, before);
        parent.insertBefore(end, before);
        content.observe(start, value => {
            if (!start.nextSibling) {
                console.log("Nodes removed from document");
                return;
            }

            let activeElement = document.activeElement;

            let before = start.nextSibling;
            before = insertContent(parent, before, value);

            if (activeElement) activeElement.focus();

            while (before != end) {
                let node = before;
                before = before.nextSibling;
                node.remove();
            }
        });
        return before;
    }
    if (before == content) {
        return content.nextSibling;
    }
    if (typeof content == "string") {
        parent.insertBefore(document.createTextNode(content), before);
        return before;
    }
    if (typeof content == "number") {
        parent.insertBefore(document.createTextNode(`${content}`), before);
        return before;
    }
    if (content.nodeType) {
        //content.style.outline = `2px solid rgb(${random()*256},${random()*256},${random()*256})`;
        parent.insertBefore(content, before);
        return before;
    }
    if (content.then) {
        return insertContent(parent, before, new Data(content).asyncResult());
    }
    if (typeof content == "function") {
        content(parent, before);
        return before;
    }
    parent.insertBefore(document.createTextNode(`${content}`), before);
    return before;
}

export function add(element, ...content) {
    insertContent(element, null, content);
}

function applyObject(target, definition, apply) {
    for (let [key, value] of Object.entries(definition)) {
        if (value.observe) {
            value.observe(target, v => apply(key, v));
        } else {
            apply(key, value);
        }
    }
}

export function classList(...names) {
    return element => {
        for (let name of names) {
            if (name.observe) {
                name.observe(element, (v, prior) => {
                    if (prior !== undefined) element.classList.remove(prior);
                    element.classList.add(v);
                });
            } else {
                element.classList.add(name);
            }
        }
    };
}

export function style(definition) {
    return element => applyObject(element, definition, (key, value) => element.style[key] = value);
}

export function properties(definition) {
    return element => applyObject(element, definition, (key, value) => element[key] = value);
}

export function attr(definition) {
    return element => applyObject(element, definition, (key, value) => element.setAttribute(key, value));
}

export function on(name, action, options) {
    return element => element.addEventListener(name, action, options);
}

export const HTML = document => new Proxy({}, {
    get: (target, name) =>
        (...content) => {
            let element = document.createElement(name);
            insertContent(element, null, content);
            return element;
        }
});

export const SVG = document => new Proxy({}, {
    get: (target, name) =>
        (...content) => {
            let element = document.createElementNS("http://www.w3.org/2000/svg", name);
            insertContent(element, null, content);
            return element;
        }
});

export function value(data) {
    return properties({
        value: data.to((v) => `${v}`),
        oninput: event => data.set(event.target.value),
    });
}




