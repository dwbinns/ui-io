class Observer {
    constructor(data, callback) {
        this.data = data;
        this.callback = callback;
    }
}

const factoryOf = v => typeof v == "function" ? v : () => v;


function checkType(value, type) {
    if (type == null) return value == null;
    if (value == null) return false;
    if (typeof type == "string") return typeof value == type;
    return value instanceof type;
}

function typeName(type) {
    if (type == null) return "null";
    if (typeof type == "function") return type.constructor.name;
    return type;
}

function check(...checks) {
    let index = 0;
    for (let [value, ...types] of checks) {
        index ++;
        if (!types.some(type => checkType(value, type))) {
            let error = new Error(`Argument ${index} not of correct type (any of: ${types.map(typeName).join(", ")})`);
            Error.captureStackTrace?.(error, check);
            throw error;
        }
    }
}

export class Data {
    #changeListeners = [];
    #references = [];

    constructor(value) {
        this.value = value;
        let error = new Error();
        error.name = "Definition";
        this.location = error.stack;
    }

    async stream(asyncIterable) {
        for await (let item of asyncIterable) {
            this.set(item);
        }
    }

    log(name) {
        this.observe(this, v => console.log(name, v));
    }

    set(value) {
        if (this.value === value) return;
        let oldValue = this.value;
        this.value = value;
        this.#changeListeners.forEach((observer) => {
            try {
                observer.deref()?.(value, oldValue)
            } catch (e) {
                console.log("Listener failure", e);
                console.log("Data", this.location);
            }
        });
    }

    get() {
        return this.value;
    }

    #notify(onChange) {
        if (typeof onChange != "function") throw new Error("Observer is not a function");
        this.#changeListeners.push(new WeakRef(onChange));
        return new Observer(this, onChange);
    }

    observe(target, callback) {
        target[Symbol()] = this.#notify(callback);
        if (this.value !== undefined) callback(this.value);
    }

    derive(from, transform) {
        this.#references.push(from.#notify(v => this.set(transform(v, this.value))));
    }

    propagate(target, transform) {
        this.#references.push(this.#notify(v => target.set(transform(v, target.value))));
    }

    to(forward, reverse) {
        check([forward, Function], [reverse, null, Function]);

        let derived = new Data();
        if (this.value !== undefined) derived.set(forward(this.value));

        if (reverse) {
            derived.propagate(this, reverse);
        }
        derived.derive(this, forward);

        return derived;
    }

    debounce(waitMS) {
        let derived = new Data();
        let timeout;
        this.observe(derived, v => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => derived.set(v), waitMS);
        });
        return derived;
    }

    asyncResult() {
        let derived = new Data();
        let latestPromise;
        this.observe(derived, promise => {
            latestPromise = promise;
            promise.then(v => latestPromise == promise && derived.set(v));
        });
        return derived;
    }

    asyncStatus() {
        let derived = new Data();
        let latestPromise;
        this.observe(derived, promise => {
            latestPromise = promise;
            derived.set("loading");
            promise.then(
                () => latestPromise == promise && derived.set("loaded"),
                () => latestPromise == promise && derived.set("failed")
            );
        });
        return derived;
    }

    map(identification, transform) {
        let cache = new Map();

        let identify =
            typeof identification == "function" ? identification
                : identification ? (item) => item[identification]
                    : (item, index) => index;

        return this.to((values) => {
            let nextCache = new Map();
            let results = values.map((v, i) => {
                let id = identify(v, i);
                let cached = cache.get(id);
                let item, index, transformed;
                if (cache.has(id)) {
                    [item, index, transformed] = cached;
                } else {
                    index = new Data();
                    item = new Data();
                    item.propagate(this, (newValue, array) => updateArray(array, index.get(), newValue));
                    let remove = () => this.set(this.get().filter((_, index) => index !== index.get()));
                    transformed = transform(item, index, { remove });
                    cached = [item, index, transformed];
                }
                index.set(i);
                item.set(v);

                nextCache.set(id, cached);
                return transformed;
            });
            cache = nextCache;
            return results;
        });
    }

    field(name) {
        return this.to(
            object => object[name] ?? null,
            (newValue, object) => object[name] == newValue
                ? object
                : { ...object, [name]: newValue }
        );
    }

    withFields(contentFactory) {
        return contentFactory(new Proxy({}, {
            get: (target, name) => this.field(name)
        }));
    }

    mapFields(identification, contentFactory) {
        return this.map(identification, (item) => item.withFields(contentFactory));
    }

    item(index, defaultValue = null) {
        return this.to(
            array => array[index] ?? defaultValue,
            (newValue, array) => updateArray(array, index, newValue),
        );
    }

    if(positive, negative) {
        let positiveFn = factoryOf(positive);
        let negativeFn = factoryOf(negative);
        return this.to(v => v ? positiveFn(v) : negativeFn(v));
    }

    is(test) {
        return this.to(v => v == test);
    }

    write(callback) {
        return this.to(x => x, (v, prior) => {
            if (v != prior) callback(v);
            return v;
        });
    }

    static from(...args) {
        let callback = checkFunction(args.pop());

        let sources = args.map(Data.check);

        let calculate = () => callback(...sources.map((source) => source.get()));
        let derived = new Data();
        sources.forEach(source => derived.derive(source, calculate));

        derived.set(calculate());
        return derived;
    }

    static periodic(callback, timeMS) {
        const data = new Data();
        const update = async () => {
            try {
                let result = callback();
                data.set(result);
                await result;
            } catch (e) {
                console.error(e);
            }
            setTimeout(update, timeMS);
        };
        update();
        return data;
    }

    static check(data) {
        if (!data instanceof Data) {
            throw new Error(`Argument is not Data`);
        }
        return data;
    }

    get status() {
        return this.#references.length;
    }
}

function checkFunction(f) {
    if (typeof f != "function") throw new Error("Argument is not a function");
    return f;
}

function updateArray(array, index, newValue) {
    return array[index] == newValue ? array
        : array.length > index ? array.map((v, i) => index == i ? newValue : v)
        : [...array, ...new Array(index - array.length), newValue];
}

