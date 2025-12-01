export function use(...middleware) {
    return middleware.flat();
}
export function includeParentExtra(parent) {
    return async (_, next) => {
        return next();
    };
}
