


function insertContent(parent, before, content) {
    if (content instanceof Array) {
        for (let item of content) {
            before = insertContent(parent, before, item);
        }
        return before;
    }
    if (content == null || content == undefined) return before;
    if (content.observe) {
        let start = document.createTextNode("");
        let end = document.createTextNode("");
        parent.insertBefore(start, before);
        parent.insertBefore(end, before);
        content.observe(start, value => {
            let before = start.nextSibling;
            if (!before) {
                console.log("Nodes removed");
                return;
            }
            before = insertContent(parent, before, value);

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
        parent.insertBefore(content, before);
        return before;
    }
    if (typeof content == "function") {
        content(parent, before);
        return before;
    }
    throw new Error(`Unable to insert: ${typeof content}`);
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


export function style(definition) {
    return element => applyObject(element, definition, (key, value) => element.style[key] = value);
}

export function properties(definition) {
    return element => applyObject(element, definition, (key, value) => element[key] = value);
}

export function on(name, action) {
    return element => element.addEventListener(name, action);
}

export const html = document => new Proxy({}, {
    get: (target, name) =>
        (...content) => {
            let element = document.createElement(name);
            insertContent(element, null, content);
            return element;
        }
});

export const svg = document => new Proxy({}, {
    get: (target, name) =>
        (...content) => {
            let element = document.createElementNS("http://www.w3.org/2000/svg", name);
            insertContent(element, null, content);
            return element;
        }
});

export function value(data) {
    return properties({
        value: data.to(v => v?.toString() || ''),
        oninput: event => {console.log(event);data.set(event.target.value)},
    });
}


