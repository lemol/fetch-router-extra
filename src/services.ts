import type { RequestContext } from '@remix-run/fetch-router'

export class RouteServiceProvider {
  #collection: Map<string, [() => any, any]>

  constructor(builders?: Map<string, () => any>) {
    this.#collection = new Map()
    if (builders) {
      for (let [name, getter] of builders) {
        this.#collection.set(name, [getter, undefined])
      }
    }
  }

  register<T>(name: string, getter: () => T): void {
    this.#collection.set(name, [getter, undefined])
  }

  resolve<T>(name: string): T {
    let [getter, instance] = this.#collection.get(name)!

    if (instance) {
      return instance
    }

    let newInstance = getter() as T
    this.#collection.set(name, [getter, newInstance])

    return newInstance
  }

  resolveAll(): Record<string, any> {
    let res: Record<string, any> = {}

    for (let [name] of this.#collection) {
      res[name] = this.resolve(name)
    }

    return res
  }
}

declare const SERVICE_TOKEN_BRAND: unique symbol

export interface ServiceToken<T> {
  readonly id: symbol
  readonly [SERVICE_TOKEN_BRAND]: T
}

export interface ServiceFactory<T> {
  resolve(context: RequestContext): T | Promise<T>
}

export type ServiceProviderValue<T> = T | ServiceFactory<T>


export function serviceOf<T>(): ServiceToken<T> {
  return { id: Symbol('service') } as ServiceToken<T>
}


export type ServiceFromToken<Token> = Token extends ServiceToken<infer T> ? T : never
