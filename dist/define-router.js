import {} from "./middleware.js";
export function defineAction(routeOrOptions, options) {
    return options ?? routeOrOptions;
}
export function defineController(routesOrOptions, options) {
    return options ?? routesOrOptions;
}
