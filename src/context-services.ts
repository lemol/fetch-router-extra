import { createStorageKey, type Middleware } from "@remix-run/fetch-router"
import { getContext } from "@remix-run/fetch-router/async-context-middleware"

const CONTEXT_SERVICES_KEY: ReturnType<typeof createStorageKey<ContextServiceCollection<any>>> = createStorageKey<ContextServiceCollection<any>>()

export function getContextServices() {
  return getContext().storage.get(CONTEXT_SERVICES_KEY)
}

type ServiceNameTypePair<N extends string, T> = { [K in N]: T }

export class ContextServiceCollection<pair extends ServiceNameTypePair<string, any>> {
  #services = new Map<string, any>()

  constructor(services: Map<string, any>) {
    this.#services = services
  }

  register<N extends keyof pair, T extends pair[N]>(name: N, service: T) {
    this.#services.set(name as string, service)
  }

  get<N extends keyof pair, T extends pair[N]>(name: N): T | undefined {
    return this.#services.get(name as string) as T | undefined
  }
}

export function loadContextServicesMiddleware<contextServices extends ContextServiceCollection<any>>(contextServices: contextServices): Middleware {
  return async ({ storage }) => {
    storage.set(CONTEXT_SERVICES_KEY, contextServices)
  }
}
