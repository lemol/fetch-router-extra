import { Route, createRouter } from '@remix-run/fetch-router';
import {} from '@remix-run/route-pattern';
import { routeMetadata, } from "./enhance-route.js";
import {} from "./services.js";
export class RouterBuilder {
    #router;
    #serviceProviderRegistry;
    constructor(options) {
        this.#router = createRouter(options);
        this.#serviceProviderRegistry = new WeakMap();
    }
    route(method, pattern, handler) {
        if (pattern instanceof Route) {
            let normalized = this.#wrapHandler(pattern, handler);
            this.#router.route(pattern.method, pattern, normalized);
            return this;
        }
        this.#router.route(method, pattern, handler);
        return this;
    }
    get(route, handler) {
        return this.route('GET', route, handler);
    }
    head(route, handler) {
        return this.route('HEAD', route, handler);
    }
    post(route, handler) {
        return this.route('POST', route, handler);
    }
    put(route, handler) {
        return this.route('PUT', route, handler);
    }
    patch(route, handler) {
        return this.route('PATCH', route, handler);
    }
    delete(route, handler) {
        return this.route('DELETE', route, handler);
    }
    options(route, handler) {
        return this.route('OPTIONS', route, handler);
    }
    map(routeOrRoutes, handlers) {
        if (routeOrRoutes instanceof Route) {
            let normalized = this.#wrapHandler(routeOrRoutes, handlers);
            this.#router.map(routeOrRoutes, normalized);
            return this;
        }
        this.#mapRouteMap(routeOrRoutes, handlers);
        return this;
    }
    build(serviceProviderRegistry) {
        this.#serviceProviderRegistry = serviceProviderRegistry;
        return this.#router;
    }
    #mapRouteMap(routes, handlers) {
        // Handle handlers wrapped with middleware
        if (handlersWithMiddleware(handlers)) {
            let wrappedHandlers = handlers.handlers;
            for (let key in routes) {
                let route = routes[key];
                if (route instanceof Route) {
                    let handler = wrappedHandlers[key];
                    // Wrap the individual handler with the shared middleware
                    let handlerWithMiddleware = {
                        middleware: handlers.middleware,
                        handler,
                    };
                    let normalized = this.#wrapHandler(route, handlerWithMiddleware);
                    this.#router.map(route, normalized);
                    continue;
                }
                if (route && typeof route === 'object') {
                    // Wrap nested handlers with parent middleware
                    let nestedHandlers = wrappedHandlers[key];
                    if (nestedHandlers && !handlersWithMiddleware(nestedHandlers)) {
                        nestedHandlers = {
                            middleware: handlers.middleware,
                            handlers: nestedHandlers,
                        };
                    }
                    this.#mapRouteMap(route, nestedHandlers);
                }
            }
            return;
        }
        // Handle regular handlers
        for (let key in routes) {
            let route = routes[key];
            if (route instanceof Route) {
                let handler = handlers[key];
                let normalized = this.#wrapHandler(route, handler);
                this.#router.map(route, normalized);
                continue;
            }
            if (route && typeof route === 'object') {
                this.#mapRouteMap(route, handlers[key]);
            }
        }
    }
    #wrapHandler(route, handler) {
        let meta = routeMetadata.get(route);
        let handlerFunction = async (context) => {
            if (meta?.body) {
                ;
                context.body = await parseBody(meta.body, context);
            }
            else if (meta) {
                ;
                context.body = undefined;
            }
            if (meta?.services) {
                let serviceProvider = this.#serviceProviderRegistry?.get(route);
                let services = serviceProvider?.resolveAll();
                console.log('resolved services for route', route, services);
                context.services = services;
            }
            if (isRequestHandlerWithMiddleware(handler)) {
                return handler.handler(context);
            }
            return handler(context);
        };
        if (isRequestHandlerWithMiddleware(handler)) {
            return {
                middleware: handler.middleware,
                handler: handlerFunction,
            };
        }
        return handlerFunction;
    }
}
function handlersWithMiddleware(handlers) {
    return (typeof handlers === 'object' &&
        handlers != null &&
        Array.isArray(handlers.middleware) &&
        'handlers' in handlers);
}
async function parseBody(schema, context) {
    if (!isStandardSchema(schema)) {
        throw new Error('Route body schema must implement StandardSchemaV1. See https://github.com/standard-schema/standard-schema');
    }
    let raw = Object.fromEntries(context.formData?.entries() ?? []);
    let result = await schema['~standard'].validate(raw);
    if (!('value' in result)) {
        throw new Error(formatStandardSchemaIssues(result.issues));
    }
    return result.value;
}
function isStandardSchema(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    let props = value['~standard'];
    return (!!props &&
        typeof props === 'object' &&
        props.version === 1 &&
        typeof props.validate === 'function');
}
function formatStandardSchemaIssues(issues) {
    if (!issues || issues.length === 0) {
        return 'Body validation failed';
    }
    return issues
        .map(issue => {
        let path = issue.path && issue.path.length > 0 ? describeStandardSchemaPath(issue.path) : '';
        return path ? `${path}: ${issue.message}` : issue.message;
    })
        .join('; ');
}
function describeStandardSchemaPath(path) {
    return path
        .map(segment => {
        let key = typeof segment === 'object' && segment != null && 'key' in segment
            ? segment.key
            : segment;
        return typeof key === 'symbol' ? key.toString() : String(key);
    })
        .join('.');
}
export function createRouterBuilder(options) {
    return new RouterBuilder(options);
}
export function isRequestHandlerWithMiddleware(handler) {
    return (typeof handler === 'object' &&
        handler != null &&
        'middleware' in handler &&
        'handler' in handler);
}
