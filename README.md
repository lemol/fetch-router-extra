# fetch-router-extra

Enhanced type-safe routing, dependency injection, and extra utilities for building web applications with [fetch-router](https://github.com/remix-run/remix/tree/main/packages/fetch-router) package.

## Features

- **Built on fetch-router**: Extends the powerful and minimal `fetch-router` with extra features
- **Dependency Injection**: Built-in support for dependency injection, making it easy to manage and test your route handlers
- **Enhanced Type Safety**: Additional type-safe utilities, including form body parsing and validation

## Goals

- **Extend fetch-router**: Build on top of the solid foundation provided by `fetch-router` to add extra features without sacrificing performance or simplicity.
- **Dependency Injection**: Provide a way to inject dependencies into route handlers, making them easier to test and manage.
- **Enhanced Type Safety**: Leverage TypeScript for compile-time route validation, body parsing, and validation.

## Installation

```sh
npm install fetch-router-extra
```

## Usage

### enhanceRoute

Given a route created with `fetch-router`'s `route()` function, `enhanceRoute()` adds extra capabilities like dependency injection and body parsing/validation.

```ts
import { route } from '@remix-run/fetch-router'
import { enhanceRoute } from 'fetch-router-extra'
let routes = route({
  home: '/home',
  cart: route({
    index: '/cart',
    add: '/cart/add',
  }),
})

let enhancedRoutes = enhanceRoute(routes.cart, {
  index: {
    services: {
      cartService: serviceOf<CartService>(),
    },
  },
  add: {
    // Add a body schema to parse and validate the request body
    body: z.object({
      itemId: z.string().uuid(),
      quantity: z.number().min(1).default(1),
    }),
    // Define services to inject into the route handler
    services: {
      cartService: serviceOf<CartService>(),
    },
  },
})
```

The `enhancedRoutes` object has the same structure as the original `routes` object, but each route now has additional type information for the body and services.

```ts
type EnhancedRoutes = typeof enhancedRoutes
// {
//   index: EnhancedRoute<'ANY', '/cart', undefined, { cartService: CartService }>
//   add: EnhancedRoute<'ANY', '/cart/add', { itemId: string; quantity: number }, { cartService: CartService }>
// }
```

The `EnhancedRoute` type extends the base `Route` type from `fetch-router` with additional type parameters for the body schema and services.

### EnhancedRouteHandlers

Similar to `fetch-router`'s `RouteHandlers`, `EnhancedRouteHandlers` allows you to register handlers for enhanced routes with type-safe access to the parsed body and injected services.


```ts
import { type EnhancedRouteHandlers } from 'fetch-router-extra'

export const cartHandlers = {
  middleware: [logger()],
  handlers: {
    index({ services }) {
      let cart = services.cartService.getCart()
      return new Response(JSON.stringify(cart), {
        headers: { 'Content-Type': 'application/json' },
      })
    },
    add({ body, services }) {
      services.cartService.addItem(body.itemId, body.quantity)
      return new Response(null, { status: 204 })
    },
  },
} satisfies EnhancedRouteHandlers<typeof enhancedRoutes>
```

### createRouterBuilder

`createRouterBuilder()` is a factory function that creates a router builder. A router builder is a utility for constructing the router in a type-safe manner. This is a replacement for `@remix-run/fetch-router`'s `createRouter()` function that adds support to exhaustively type the routes.

The `build()` method finalizes the router construction and returns the fully typed router. It ensures that all routes are defined and correctly typed according to the provided route definitions.

```ts
import { createRouterBuilder } from 'fetch-router-extra'

const router = createRouterBuilder<typeof routes>()
  .route(routes.home, homeHandlers)
  .route(cartEnhancedRoute, cartHandlers)
  .build()
```

## Related Work

- [@remix-run/fetch-router](https://github.com/remix-run/remix/tree/main/packages/fetch-router) - A minimal, composable router for the web Fetch API

## License

See [LICENSE](https://github.com/lemol/fetch-router-extra/blob/main/LICENSE)
