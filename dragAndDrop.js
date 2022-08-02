import { HTML, on, style, attr } from "ui-io";
const { span } = HTML(document);

export function draggable(handle) {
    return span(
        attr({ draggable: true }),
        style({
            cursor: 'grab',
        }),
        handle,
        on("dragstart", event => {
            let dragElement = event.target.parentNode;
            let rect = dragElement.getBoundingClientRect();
            event.dataTransfer.setDragImage(dragElement, event.clientX - rect.left, event.clientY - rect.top);
        })
    );
}


export function drag(contentType, data$, remove, restore$) {
    let prior;
    return [
        on("dragstart", event => {
            prior = restore$.get();
            event.dataTransfer.setData(contentType, data$.get());
            remove && setTimeout(remove, 0);
        }),
        on("dragend", event => {
            console.log("dragend", event.dataTransfer.dropEffect);
            if (event.dataTransfer.dropEffect != "move") {
                restore$.set(prior);
            }
        }),   
    ];
}


export function dragleave(action) {
    return [
        on("dragleave", event => {
            console.log("dragleave", event.currentTarget, event.relatedTarget, event.currentTarget.contains(event.relatedTarget) || event.currentTarget.contains(event.relatedTarget?.getRootNode()?.host));
            if (!(event.currentTarget.contains(event.relatedTarget) || event.currentTarget.contains(event.relatedTarget?.getRootNode()?.host))) {
                action();
            }
        }),
    ];
}

export function drop(contentType, action) {
    return [
        on("dragover", event => event.preventDefault()),
        on("drop", event => {
            event.preventDefault();
            console.log("drop", event.dataTransfer.getData(contentType));
            action(event.dataTransfer.getData(contentType));
        })
    ];

}
