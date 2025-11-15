import { Route, createRouter } from '@remix-run/fetch-router'
import type {
  Middleware,
  RequestContext,
  RequestHandler,
  RequestMethod,
  RouteHandler as BaseRouteHandler,
  RouteHandlers as BaseRouteHandlers,
  RouteMap,
  Router,
  RouterOptions,
} from '@remix-run/fetch-router'
import { type Params, type RoutePattern } from '@remix-run/route-pattern'
import type { StandardSchemaV1 } from '@standard-schema/spec'

import {
  routeMetadata,
  type EnhancedRouteHandler,
  type EnhancedRouteHandlers,
  type EnhancedRouteHandlersWithMiddleware,
  type EnhancedRequestHandler,
} from './enhance-route.ts'
import { type RouteServiceProvider } from './services.ts'

type IsBroadRouteMap<T> = [RouteMap] extends [T]
  ? ([T] extends [RouteMap] ? true : false)
  : false

type RoutePatternOf<T> = T extends Route<any, infer Pattern extends string> ? Pattern : string
type RouteMethodOf<T> = T extends Route<infer Method extends RequestMethod | 'ANY', any>
  ? Method
  : RequestMethod | 'ANY'
type RouteSignatureOf<T> = T extends Route<any, any>
  ? `${RouteMethodOf<T>} ${RoutePatternOf<T>}`
  : `${RequestMethod | 'ANY'} ${string}`

type RouteSignatureUnion<T> = T extends Route<any, any>
  ? RouteSignatureOf<T>
  : IsBroadRouteMap<T> extends true
    ? `${RequestMethod | 'ANY'} ${string}`
    : T extends Record<string, any>
      ? {
          [K in keyof T & string]: RouteSignatureUnion<T[K]>
        }[keyof T & string]
      : never

type RouteInRemaining<Remaining, Value extends Route<any, any>> = RouteSignatureOf<Value> extends Remaining
  ? Value
  : never

type RouteMapInRemaining<Remaining, Value> = RouteSignatureUnion<Value> extends never
  ? Value
  : RouteSignatureUnion<Value> extends Remaining
    ? Value
    : never

type MarkHandled<Remaining, Value> = Value extends Route<any, any>
  ? Exclude<Remaining, RouteSignatureOf<Value>>
  : Exclude<Remaining, RouteSignatureUnion<Value>>

type HasUnmappedRoutes<T> = [T] extends [never] ? false : true

type RouteHandlerOutput =
  | RequestHandler
  | {
      middleware: Middleware[]
      handler: RequestHandler
    }

export class RouterBuilder<
  RootMap extends RouteMap = RouteMap,
  Remaining = RouteSignatureUnion<RootMap>,
> {
  #router: Router
  #serviceProviderRegistry: WeakMap<Route<any, any>, RouteServiceProvider>

  constructor(options?: RouterOptions) {
    this.#router = createRouter(options)
    this.#serviceProviderRegistry = new WeakMap()
  }

  route<method extends RequestMethod | 'ANY', pattern extends string>(
    method: method,
    pattern: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<method, pattern>> | BaseRouteHandler<method, pattern>,
  ): RouterBuilder<RootMap, Remaining>
  route<method extends RequestMethod | 'ANY', pattern extends string, Value extends Route<method | 'ANY', pattern>>(
    method: method,
    pattern: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<method, pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  route(method: any, pattern: any, handler: any): any {
    if (pattern instanceof Route) {
      let normalized = this.#wrapHandler(pattern, handler as any)
      this.#router.route(pattern.method as any, pattern, normalized)
      return this
    }

    this.#router.route(method, pattern as any, handler)
    return this
  }

  get<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'GET', pattern>> | BaseRouteHandler<'GET', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  get<pattern extends string, Value extends Route<'GET' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'GET', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  get(route: any, handler: any): any {
    return this.route('GET', route, handler)
  }

  head<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'HEAD', pattern>> | BaseRouteHandler<'HEAD', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  head<pattern extends string, Value extends Route<'HEAD' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'HEAD', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  head(route: any, handler: any): any {
    return this.route('HEAD', route, handler)
  }

  post<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'POST', pattern>> | BaseRouteHandler<'POST', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  post<pattern extends string, Value extends Route<'POST' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'POST', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  post(route: any, handler: any): any {
    return this.route('POST', route, handler)
  }

  put<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'PUT', pattern>> | BaseRouteHandler<'PUT', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  put<pattern extends string, Value extends Route<'PUT' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'PUT', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  put(route: any, handler: any): any {
    return this.route('PUT', route, handler)
  }

  patch<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'PATCH', pattern>> | BaseRouteHandler<'PATCH', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  patch<pattern extends string, Value extends Route<'PATCH' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'PATCH', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  patch(route: any, handler: any): any {
    return this.route('PATCH', route, handler)
  }

  delete<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'DELETE', pattern>> | BaseRouteHandler<'DELETE', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  delete<pattern extends string, Value extends Route<'DELETE' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'DELETE', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  delete(route: any, handler: any): any {
    return this.route('DELETE', route, handler)
  }

  options<pattern extends string>(
    route: pattern | RoutePattern<pattern>,
    handler: EnhancedRouteHandler<Route<'OPTIONS', pattern>> | BaseRouteHandler<'OPTIONS', pattern>,
  ): RouterBuilder<RootMap, Remaining>
  options<pattern extends string, Value extends Route<'OPTIONS' | 'ANY', pattern>>(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Value> | BaseRouteHandler<'OPTIONS', pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  options(route: any, handler: any): any {
    return this.route('OPTIONS', route, handler)
  }

  map<
    method extends RequestMethod | 'ANY',
    pattern extends string,
    Value extends Route<method, pattern>,
  >(
    route: RouteInRemaining<Remaining, Value>,
    handler: EnhancedRouteHandler<Route<method, pattern>> | BaseRouteHandler<method, pattern>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, Value>>
  map<routeMap extends RouteMap>(
    routes: RouteMapInRemaining<Remaining, routeMap>,
    handlers: EnhancedRouteHandlers<routeMap> | BaseRouteHandlers<routeMap>,
  ): RouterBuilder<RootMap, MarkHandled<Remaining, routeMap>>
  map(routeOrRoutes: Route<any, any> | RouteMap, handlers: any): any {
    if (routeOrRoutes instanceof Route) {
      let normalized = this.#wrapHandler(routeOrRoutes, handlers)
      this.#router.map(routeOrRoutes, normalized)
      return this
    }

    this.#mapRouteMap(routeOrRoutes, handlers)
    return this
  }

  build(this: HasUnmappedRoutes<Remaining> extends true ? never : RouterBuilder<RootMap, Remaining>, serviceProviderRegistry: WeakMap<Route<any, any>, RouteServiceProvider>): Router {
    this.#serviceProviderRegistry = serviceProviderRegistry
    return this.#router
  }

  #mapRouteMap(
    routes: RouteMap,
    handlers: any,
  ): void {
    // Handle handlers wrapped with middleware
    if (handlersWithMiddleware(handlers)) {
      let wrappedHandlers = handlers.handlers as any
      for (let key in routes) {
        let route = routes[key]
        
        if (route instanceof Route) {
          let handler = wrappedHandlers[key]
          // Wrap the individual handler with the shared middleware
          let handlerWithMiddleware = {
            middleware: handlers.middleware,
            handler,
          }
          let normalized = this.#wrapHandler(route, handlerWithMiddleware as any)
          this.#router.map(route, normalized)
          continue
        }

        if (route && typeof route === 'object') {
          // Wrap nested handlers with parent middleware
          let nestedHandlers = wrappedHandlers[key]
          if (nestedHandlers && !handlersWithMiddleware(nestedHandlers)) {
            nestedHandlers = {
              middleware: handlers.middleware,
              handlers: nestedHandlers,
            }
          }
          this.#mapRouteMap(route, nestedHandlers)
        }
      }
      return
    }

    // Handle regular handlers
    for (let key in routes) {
      let route = routes[key]
      
      if (route instanceof Route) {
        let handler = handlers[key]
        let normalized = this.#wrapHandler(route, handler)
        this.#router.map(route, normalized)
        continue
      }

      if (route && typeof route === 'object') {
        this.#mapRouteMap(route, handlers[key])
      }
    }
  }

  #wrapHandler(
    route: Route<any, any>,
    handler: RequestHandler | EnhancedRequestHandler<Route<any, any>>,
  ): RouteHandlerOutput {
    let meta = routeMetadata.get(route)

    let handlerFunction = async (context: RequestContext) => {
      if (meta?.body) {
        ;(context as any).body = await parseBody(meta.body, context)
      } else if (meta) {
        ;(context as any).body = undefined
      }

      if (meta?.services) {
        let serviceProvider = this.#serviceProviderRegistry?.get(route)
        let services = serviceProvider?.resolveAll()
        ;(context as any).services = services
      }

      if (isRequestHandlerWithMiddleware(handler)) {
        return handler.handler(context)
      }

      return (handler as any)(context as any)
    }

    if (isRequestHandlerWithMiddleware(handler)) {
      return {
        middleware: handler.middleware,
        handler: handlerFunction,
      }
    }

    return handlerFunction
  }
}

function handlersWithMiddleware(handlers: any): handlers is EnhancedRouteHandlersWithMiddleware<RouteMap> {
  return (
    typeof handlers === 'object' &&
    handlers != null &&
    Array.isArray((handlers as any).middleware) &&
    'handlers' in handlers
  )
}

async function parseBody(schema: StandardSchemaV1, context: RequestContext): Promise<any> {
  if (!isStandardSchema(schema)) {
    throw new Error(
      'Route body schema must implement StandardSchemaV1. See https://github.com/standard-schema/standard-schema'
    )
  }

  let raw = Object.fromEntries(context.formData?.entries() ?? [])
  let result = await schema['~standard'].validate(raw)

  if (!('value' in result)) {
    throw new Error(formatStandardSchemaIssues(result.issues))
  }

  return result.value
}

function isStandardSchema(value: unknown): value is StandardSchemaV1<any, any> {
  if (!value || typeof value !== 'object') {
    return false
  }

  let props = (value as Record<string, any>)['~standard']

  return (
    !!props &&
    typeof props === 'object' &&
    props.version === 1 &&
    typeof props.validate === 'function'
  )
}

function formatStandardSchemaIssues(
  issues: StandardSchemaV1.FailureResult['issues'] | undefined,
): string {
  if (!issues || issues.length === 0) {
    return 'Body validation failed'
  }

  return issues
    .map(issue => {
      let path = issue.path && issue.path.length > 0 ? describeStandardSchemaPath(issue.path) : ''
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}

function describeStandardSchemaPath(
  path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment>,
): string {
  return path
    .map(segment => {
      let key =
        typeof segment === 'object' && segment != null && 'key' in segment
          ? (segment as StandardSchemaV1.PathSegment).key
          : segment

      return typeof key === 'symbol' ? key.toString() : String(key)
    })
    .join('.')
}

export function createRouterBuilder<RootMap extends RouteMap = RouteMap>(
  options?: RouterOptions,
): RouterBuilder<RootMap, RouteSignatureUnion<RootMap>> {
  return new RouterBuilder<RootMap, RouteSignatureUnion<RootMap>>(options)
}

type RequestHandlerWithMiddleware<method extends RequestMethod | 'ANY', pattern extends string> = {
  middleware: Middleware<method, Params<pattern>>[]
  handler: RequestHandler<method, Params<pattern>>
}

export function isRequestHandlerWithMiddleware<
  method extends RequestMethod | 'ANY',
  pattern extends string,
>(handler: any): handler is RequestHandlerWithMiddleware<method, pattern> {
  return (
    typeof handler === 'object' &&
    handler != null &&
    'middleware' in handler &&
    'handler' in handler
  )
}
