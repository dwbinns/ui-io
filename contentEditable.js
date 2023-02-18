import { Data, on, properties } from "ui-io";

const shallowEquals = (a1, a2) => a1 && a2 && a1.length == a2.length && a1.every((item, index) => a2[index] == item);

function getParentOffset(node, offset, parent) {

    if (parent.nodeType == Node.TEXT_NODE) {
        if (parent == node) return offset;
        return parent.nodeValue.length;
    }

    let count = 0;
    if (parent.nodeType == Node.ELEMENT_NODE) {
        if (parent == node) {
            for (let child of [...parent.childNodes].slice(0, offset)) {
                count += getParentOffset(node, offset, child);
            }
        }
        for (let child of parent.childNodes) {
            count += getParentOffset(node, offset, child);
            if (child.contains(node)) break;
        }
    }
    return count;
}

function getChildOffset(parent, offset) {

    function findChild(node) {
        if (node.nodeType == Node.TEXT_NODE) {
            let textLength = node.nodeValue.length;
            if (textLength >= offset) return node;
            offset -= textLength;
        }
        if (node.nodeType == Node.ELEMENT_NODE) {
            if (offset == 0) return node;
            for (let child of node.childNodes) {
                let found = findChild(child);
                if (found) return found;
            }
        }
    }

    let found = findChild(parent);
    if (found) return [found, offset];
    return [parent, parent.childNodes.length];
}

export function contentEditable(content$, selection$ = new Data()) {

    let history = [];
    let content, selection;

    function getSelection(event) {
        let browserSelection = window.getSelection();
        let anchorOffset = getParentOffset(browserSelection.anchorNode, browserSelection.anchorOffset, event.currentTarget);
        let focusOffset = getParentOffset(browserSelection.focusNode, browserSelection.focusOffset, event.currentTarget);
        selection = [anchorOffset, focusOffset];
        selection$.set(selection);
    }

    function setSelection(element) {
        if (!selection) return;
        let [anchorOffset, focusOffset] = selection;
        window.getSelection().setBaseAndExtent(
            ...getChildOffset(element, anchorOffset),
            ...getChildOffset(element, focusOffset)
        );
    }



    return [
        properties({ contentEditable: true }),
        on('beforeinput', event => {
            //console.log("before input event", event.inputType, event.currentTarget.innerHTML);
            if (event.inputType == "historyUndo") {
                history.pop();
                event.currentTarget.innerHTML = history.pop();
            }
        }),
        on('input', event => {
            //console.log("input event", event.inputType, event.currentTarget.innerHTML);
            content = [...event.currentTarget.childNodes];
            getSelection(event);
            content$.set(content);
        }),
        on('keydown', event => {
            if (event.key == "Enter") {
                document.execCommand('insertLineBreak');
                event.preventDefault();
            }
        }),
        on('keyup', getSelection),
        on('click', getSelection),
        on('blur', () => selection$.set(null)),
        on('focus', getSelection),
        (element) => content$.observe(element, newContent => {
            if (content == newContent) return;
            content = newContent;
            element.replaceChildren(...content);
            setSelection(element);
            history.push(element.innerHTML);
        }),
    ];
}

export function textExtract(content) {
    return content.map(node => {
        if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
        if (node.nodeType == Node.ELEMENT_NODE) return (["P", "DIV"].includes(node.nodeName) ? "\n" : "") + textExtract([...node.childNodes]);
        return '';
    }).join("");
}