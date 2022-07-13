import { Data } from "./Data.js";

export function locationHashData() {
    const hash$ = new Data(location.hash.slice(1));
    hash$.observe(window, v => location.hash = `#${v}`);
    window.addEventListener('hashchange', () => hash$.set(location.hash.slice(1)));
    return hash$;
}

export function locationPathData() {
    const path$ = new Data(location.pathname);

    path$.observe(window, path => {
        let newLocation = new URL(path, location.href).toString();
        if (newLocation != location.href) history.pushState(null, '', newLocation);
    });
    window.addEventListener('popstate', () => path$.set(location.pathname));
    return path$;
}

export function searchParamsTransform() {
    return [
        string => Object.fromEntries(new URLSearchParams(string)),
        object => new URLSearchParams(object).toString(),
    ];
}

export function route(location$, routes, defaultRoute) {
    let parts$ = location$.to(string => string.replace(/^\//, '').split("/"));
    let head$ = parts$.item(0);

    return head$.to(head =>
        (routes[head] || defaultRoute)(
            parts$.to((parts, prior) =>
                parts[0] == head ? parts.slice(1).join("/") : prior
            )
        )
    );
}
