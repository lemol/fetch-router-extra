export class RouteServiceProvider {
    #collection;
    constructor(builders) {
        this.#collection = new Map();
        if (builders) {
            for (let [name, getter] of builders) {
                this.#collection.set(name, [getter, undefined]);
            }
        }
    }
    register(name, getter) {
        this.#collection.set(name, [getter, undefined]);
    }
    resolve(name) {
        let [getter, instance] = this.#collection.get(name);
        if (instance) {
            return instance;
        }
        let newInstance = getter();
        this.#collection.set(name, [getter, newInstance]);
        return newInstance;
    }
    resolveAll() {
        let res = {};
        for (let [name] of this.#collection) {
            res[name] = this.resolve(name);
        }
        return res;
    }
}
export function serviceOf() {
    return { id: Symbol('service') };
}
