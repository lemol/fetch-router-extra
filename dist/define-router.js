import {} from "./middleware.js";
export function defineRouter(routeOrOptions, options) {
    return options ?? routeOrOptions;
}
