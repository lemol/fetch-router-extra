import type { RequestContext } from '@remix-run/fetch-router';
export declare class RouteServiceProvider {
    #private;
    constructor(builders?: Map<string, () => any>);
    register<T>(name: string, getter: () => T): void;
    resolve<T>(name: string): T;
    resolveAll(): Record<string, any>;
}
declare const SERVICE_TOKEN_BRAND: unique symbol;
export interface ServiceToken<T> {
    readonly id: symbol;
    readonly [SERVICE_TOKEN_BRAND]: T;
}
export interface ServiceFactory<T> {
    resolve(context: RequestContext): T | Promise<T>;
}
export type ServiceProviderValue<T> = T | ServiceFactory<T>;
export declare function serviceOf<T>(): ServiceToken<T>;
export type ServiceFromToken<Token> = Token extends ServiceToken<infer T> ? T : never;
export {};
//# sourceMappingURL=services.d.ts.map