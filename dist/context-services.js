import { createStorageKey } from "@remix-run/fetch-router";
import { getContext } from "@remix-run/fetch-router/async-context-middleware";
const CONTEXT_SERVICES_KEY = createStorageKey();
export function getContextServices() {
    return getContext().storage.get(CONTEXT_SERVICES_KEY);
}
export class ContextServiceCollection {
    #services = new Map();
    constructor(services) {
        this.#services = services;
    }
    register(name, service) {
        this.#services.set(name, service);
    }
    get(name) {
        return this.#services.get(name);
    }
}
export function loadContextServicesMiddleware(contextServices) {
    return async ({ storage }) => {
        storage.set(CONTEXT_SERVICES_KEY, contextServices);
    };
}
