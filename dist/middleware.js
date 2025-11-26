class ParentMiddleware {
    constructor(_parent) { }
}
export function use(parentOrMiddleware, middleware) {
    return middleware ?? parentOrMiddleware;
}
/**
 * Create a parent middleware reference for type inheritance.
 *
 * Used with `use` to pass parent middleware types without
 * requiring the runtime parent object.
 *
 * @example
 * ```ts
 * let postsMiddleware = [authMiddleware]
 * let childMiddleware = use(
 *   withParent<typeof postsMiddleware>(),
 *   [loggerMiddleware]
 * )
 * ```
 */
export function withParent() {
    return new ParentMiddleware(null);
}
