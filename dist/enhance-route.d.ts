import { Route } from '@remix-run/fetch-router';
import type { Middleware, RequestContext, RequestMethod, RouteMap } from '@remix-run/fetch-router';
import type { Params } from '@remix-run/route-pattern';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ServiceFromToken, ServiceProviderValue, ServiceToken } from './services.ts';
declare const BODY_BRAND: unique symbol;
declare const SERVICES_BRAND: unique symbol;
export interface RouteMetadata {
    body?: StandardSchemaV1;
    services?: Record<string, ServiceToken<any>>;
}
export declare const routeMetadata: WeakMap<Route<any, any>, RouteMetadata>;
type SchemaOutput<Schema> = [Schema] extends [undefined] ? undefined : Schema extends StandardSchemaV1<any, infer Output> ? Output : unknown;
type BodyValue<Body> = Body extends {
    schema: infer Schema;
} ? SchemaOutput<Schema> : SchemaOutput<Body>;
type RouteMethodType<route extends Route<any, any>> = route extends Route<infer method extends RequestMethod | 'ANY', any> ? method : RequestMethod | 'ANY';
type RoutePatternType<route extends Route<any, any>> = route extends Route<any, infer pattern extends string> ? pattern : string;
type BodyTypeForRoute<route extends Route<any, any>> = route extends {
    [BODY_BRAND]: infer Body;
} ? Body : undefined;
type RouteServicesType<route extends Route<any, any>> = route extends {
    [SERVICES_BRAND]: infer Services;
} ? Services : {};
export type RouteServicesProviderType<route extends Route<any, any>> = {
    [K in keyof RouteServicesType<route>]: ServiceProviderValue<RouteServicesType<route>[K]>;
};
export type EnhancedRequestContext<route extends Route<any, any>> = RequestContext<RouteMethodType<route>, Params<RoutePatternType<route>>> & {
    body: BodyTypeForRoute<route>;
    services: RouteServicesType<route>;
};
export type EnhancedRequestHandler<route extends Route<any, any>, Result = Response> = (context: EnhancedRequestContext<route>) => Result | Promise<Result>;
export interface EnhancedRouteHandlerConfig<route extends Route<any, any>> {
    handler: EnhancedRequestHandler<route>;
    middleware?: Middleware<RouteMethodType<route>, Params<RoutePatternType<route>>>[];
    services?: RouteServicesProviderType<route>;
}
export type EnhancedRouteHandler<route extends Route<any, any>> = EnhancedRequestHandler<route> | EnhancedRouteHandlerConfig<route>;
type EnhancedServicesMap<routes extends RouteMap> = {
    [K in keyof routes]?: routes[K] extends Route<any, any> ? RouteServicesProviderType<routes[K]> : routes[K] extends RouteMap ? EnhancedServicesMap<routes[K]> : never;
};
interface EnhancedHandlersServices<routes extends RouteMap> {
    services?: EnhancedServicesMap<routes>;
}
type EnhancedHandlersMap<routes extends RouteMap> = {
    [K in keyof routes]: routes[K] extends Route<any, any> ? EnhancedRouteHandler<routes[K]> : routes[K] extends RouteMap ? EnhancedRouteHandlers<routes[K]> : never;
};
export type RouteEnhancementLeaf<Services extends Record<string, ServiceToken<any>> = Record<string, ServiceToken<any>>, Body extends StandardSchemaV1 = any> = {
    services: Services;
    body?: undefined;
} | {
    services?: undefined;
    body: Body;
} | {
    services: Services;
    body: Body;
};
export type RouteEnhancementConfig<routes extends RouteMap> = {
    [K in keyof routes]?: routes[K] extends Route<any, any> ? RouteEnhancementLeaf : routes[K] extends RouteMap ? RouteEnhancementConfig<routes[K]> : never;
};
type ExtractChildConfig<routes extends RouteMap, Value> = Value extends RouteEnhancementConfig<routes> ? Value : RouteEnhancementConfig<routes>;
export type BodyValueFromConfig<Config> = Config extends RouteEnhancementLeaf<any, infer Body> ? BodyValue<Body> : undefined;
export type ServicesValue<Config> = Config extends RouteEnhancementLeaf<infer Services, any> ? {
    [K in keyof Services]: ServiceFromToken<Services[K]>;
} : {};
export type EnhancedRoute<method extends RequestMethod | 'ANY', pattern extends string, Body = undefined, Services extends Record<string, any> = {}> = Route<method, pattern> & {
    readonly [BODY_BRAND]: Body;
    readonly [SERVICES_BRAND]: Services;
};
export type EnhancedRouteMap<routes extends RouteMap, config extends RouteEnhancementConfig<routes>> = {
    [K in keyof routes]: routes[K] extends Route<infer method, infer pattern extends string> ? EnhancedRoute<method, pattern, BodyValueFromConfig<config[K]>, ServicesValue<config[K]>> : routes[K] extends RouteMap ? EnhancedRouteMap<routes[K], ExtractChildConfig<routes[K], config[K]>> : never;
};
export type EnhancedRouteHandlers<routes extends RouteMap> = (EnhancedHandlersMap<routes> & EnhancedHandlersServices<routes>) | EnhancedRouteHandlersWithMiddleware<routes>;
export interface EnhancedRouteHandlersWithMiddleware<routes extends RouteMap> extends EnhancedHandlersServices<routes> {
    middleware: Middleware[];
    handlers: EnhancedRouteHandlers<routes>;
}
export declare function enhanceRoute<route extends Route<any, any>, config extends RouteEnhancementLeaf = RouteEnhancementLeaf>(route: route, config: config): EnhancedRoute<RouteMethodType<route>, RoutePatternType<route>, BodyValueFromConfig<config>, ServicesValue<config>>;
export declare function enhanceRoute<routes extends RouteMap, config extends RouteEnhancementConfig<routes>>(routes: routes, config: config): EnhancedRouteMap<routes, config>;
export {};
//# sourceMappingURL=enhance-route.d.ts.map