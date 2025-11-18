import { type Middleware } from "@remix-run/fetch-router";
export declare function getContextServices(): ContextServiceCollection<any>;
type ServiceNameTypePair<N extends string, T> = {
    [K in N]: T;
};
export declare class ContextServiceCollection<pair extends ServiceNameTypePair<string, any>> {
    #private;
    constructor(services: Map<string, any>);
    register<N extends keyof pair, T extends pair[N]>(name: N, service: T): void;
    get<N extends keyof pair, T extends pair[N]>(name: N): T | undefined;
}
export declare function loadContextServicesMiddleware<contextServices extends ContextServiceCollection<any>>(contextServices: contextServices): Middleware;
export {};
//# sourceMappingURL=context-services.d.ts.map