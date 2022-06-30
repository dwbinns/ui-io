import { Data } from "./Data.js";

export function locationHashData() {
    const hash$ = new Data(location.hash.slice(1));
    hash$.observe(window, v => location.hash = `#${v}`);
    window.addEventListener('hashchange', () => {
        hash$.set(location.hash.slice(1))
    });
    return hash$;
}

export function searchParamsTransform() {
    return [
        string => Object.fromEntries(new URLSearchParams(string)),
        object => new URLSearchParams(object).toString(),
    ];
}

