import { Route } from '@remix-run/fetch-router';
import type { Middleware, RequestHandler, RequestMethod, RouteHandler as BaseRouteHandler, RouteHandlers as BaseRouteHandlers, RouteMap, Router, RouterOptions } from '@remix-run/fetch-router';
import { type Params, type RoutePattern } from '@remix-run/route-pattern';
import { type EnhancedRouteHandler, type EnhancedRouteHandlers } from './enhance-route.ts';
import { type RouteServiceProvider } from './services.ts';
import { ContextServiceCollection } from './context-services.ts';
type IsBroadRouteMap<T> = [RouteMap] extends [T] ? ([T] extends [RouteMap] ? true : false) : false;
type RoutePatternOf<T> = T extends Route<any, infer Pattern extends string> ? Pattern : string;
type RouteMethodOf<T> = T extends Route<infer Method extends RequestMethod | 'ANY', any> ? Method : RequestMethod | 'ANY';
type RouteSignatureOf<T> = T extends Route<any, any> ? `${RouteMethodOf<T>} ${RoutePatternOf<T>}` : `${RequestMethod | 'ANY'} ${string}`;
type RouteSignatureUnion<T> = T extends Route<any, any> ? RouteSignatureOf<T> : IsBroadRouteMap<T> extends true ? `${RequestMethod | 'ANY'} ${string}` : T extends Record<string, any> ? {
    [K in keyof T & string]: RouteSignatureUnion<T[K]>;
}[keyof T & string] : never;
type RouteInRemaining<Remaining, Value extends Route<any, any>> = RouteSignatureOf<Value> extends Remaining ? Value : never;
type RouteMapInRemaining<Remaining, Value> = RouteSignatureUnion<Value> extends never ? Value : RouteSignatureUnion<Value> extends Remaining ? Value : never;
type MarkHandled<Remaining, Value> = Value extends Route<any, any> ? Exclude<Remaining, RouteSignatureOf<Value>> : Exclude<Remaining, RouteSignatureUnion<Value>>;
type HasUnmappedRoutes<T> = [T] extends [never] ? false : true;
export declare class RouterBuilder<RootMap extends RouteMap = RouteMap, Remaining = RouteSignatureUnion<RootMap>> {
    #private;
    constructor(options?: RouterOptions);
    route<method extends RequestMethod | 'ANY', pattern extends string>(method: method, pattern: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<method, pattern>> | BaseRouteHandler<method, pattern>): RouterBuilder<RootMap, Remaining>;
    route<method extends RequestMethod | 'ANY', pattern extends string, Value extends Route<method | 'ANY', pattern>>(method: method, pattern: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<method, pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    get<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'GET', pattern>> | BaseRouteHandler<'GET', pattern>): RouterBuilder<RootMap, Remaining>;
    get<pattern extends string, Value extends Route<'GET' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'GET', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    head<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'HEAD', pattern>> | BaseRouteHandler<'HEAD', pattern>): RouterBuilder<RootMap, Remaining>;
    head<pattern extends string, Value extends Route<'HEAD' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'HEAD', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    post<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'POST', pattern>> | BaseRouteHandler<'POST', pattern>): RouterBuilder<RootMap, Remaining>;
    post<pattern extends string, Value extends Route<'POST' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'POST', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    put<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'PUT', pattern>> | BaseRouteHandler<'PUT', pattern>): RouterBuilder<RootMap, Remaining>;
    put<pattern extends string, Value extends Route<'PUT' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'PUT', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    patch<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'PATCH', pattern>> | BaseRouteHandler<'PATCH', pattern>): RouterBuilder<RootMap, Remaining>;
    patch<pattern extends string, Value extends Route<'PATCH' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'PATCH', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    delete<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'DELETE', pattern>> | BaseRouteHandler<'DELETE', pattern>): RouterBuilder<RootMap, Remaining>;
    delete<pattern extends string, Value extends Route<'DELETE' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'DELETE', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    options<pattern extends string>(route: pattern | RoutePattern<pattern>, handler: EnhancedRouteHandler<Route<'OPTIONS', pattern>> | BaseRouteHandler<'OPTIONS', pattern>): RouterBuilder<RootMap, Remaining>;
    options<pattern extends string, Value extends Route<'OPTIONS' | 'ANY', pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'OPTIONS', pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    ignore<method extends RequestMethod | 'ANY', pattern extends string, Value extends Route<method, pattern>>(route: RouteInRemaining<Remaining, Value>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    ignore<routeMap extends RouteMap>(routes: RouteMapInRemaining<Remaining, routeMap>): RouterBuilder<RootMap, MarkHandled<Remaining, routeMap>>;
    map<method extends RequestMethod | 'ANY', pattern extends string, Value extends Route<method, pattern>>(route: RouteInRemaining<Remaining, Value>, handler: EnhancedRouteHandler<Route<method, pattern>> | BaseRouteHandler<method, pattern>): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>;
    map<routeMap extends RouteMap>(routes: RouteMapInRemaining<Remaining, routeMap>, handlers: EnhancedRouteHandlers<routeMap> | BaseRouteHandlers<routeMap>): RouterBuilder<RootMap, MarkHandled<Remaining, routeMap>>;
    build<contextServices extends ContextServiceCollection<any>>(this: HasUnmappedRoutes<Remaining> extends true ? never : RouterBuilder<RootMap, Remaining>, serviceProviderRegistry: WeakMap<Route<any, any>, RouteServiceProvider>, contextServices: contextServices): Router;
}
export declare function createRouterBuilder<RootMap extends RouteMap = RouteMap>(options?: RouterOptions): RouterBuilder<RootMap, RouteSignatureUnion<RootMap>>;
type RequestHandlerWithMiddleware<method extends RequestMethod | 'ANY', pattern extends string> = {
    middleware: Middleware<method, Params<pattern>>[];
    handler: RequestHandler<method, Params<pattern>>;
};
export declare function isRequestHandlerWithMiddleware<method extends RequestMethod | 'ANY', pattern extends string>(handler: any): handler is RequestHandlerWithMiddleware<method, pattern>;
export {};
//# sourceMappingURL=router-builder.d.ts.map