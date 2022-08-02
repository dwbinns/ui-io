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

    function getSelection(event) {
        let selection = window.getSelection();
        let anchorOffset = getParentOffset(selection.anchorNode, selection.anchorOffset, event.currentTarget);
        let focusOffset = getParentOffset(selection.focusNode, selection.focusOffset, event.currentTarget);
        selection$.set([anchorOffset, focusOffset]);
    }

    return [
        properties({ contentEditable: true }),
        on('input', event => {
            let childNodes = [...event.currentTarget.childNodes];
            getSelection(event);
            content$.set(childNodes);
        }),
        on('keyup', getSelection),
        on('click', getSelection),
        on('blur', () => selection$.set(null)),
        on('focus', getSelection),
        (element) => Data.from(content$, selection$, (content, cursor) => [content, cursor]).observe(element,
            ([content, selection]) => {
                if (shallowEquals(content$.get(), [...element.childNodes])) return;
                element.replaceChildren(...content);
                if (selection) {
                    let [anchorOffset, focusOffset] = selection;
                    window.getSelection().setBaseAndExtent(
                        ...getChildOffset(element, anchorOffset),
                        ...getChildOffset(element, focusOffset)
                    );
                }
            }
        )
    ];
}

export function textExtract(content) {
    return content.map(node => {
        if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
        if (node.nodeType == Node.ELEMENT_NODE) return textExtract([...node.childNodes]);
        return '';
    }).join("");
}