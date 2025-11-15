import { Route } from '@remix-run/fetch-router';
export const routeMetadata = new WeakMap();
export function enhanceRoute(routeOrRoutes, config) {
    if (routeOrRoutes instanceof Route) {
        applyLeafEnhancement(routeOrRoutes, config);
        return routeOrRoutes;
    }
    applyEnhancements(routeOrRoutes, config);
    return routeOrRoutes;
}
function applyEnhancements(routes, config) {
    if (routes == null) {
        return;
    }
    for (let key in routes) {
        let value = routes[key];
        let detail = config ? config[key] : undefined;
        if (value instanceof Route) {
            applyLeafEnhancement(value, detail);
        }
        else if (value && typeof value === 'object') {
            applyEnhancements(value, detail);
        }
    }
}
function applyLeafEnhancement(route, detail) {
    if (detail == null) {
        return;
    }
    let meta = routeMetadata.get(route);
    if (!meta) {
        meta = {};
    }
    if ('services' in detail && detail.services) {
        meta.services = detail.services;
    }
    if ('body' in detail && detail.body !== undefined) {
        meta.body = detail.body;
    }
    if ((meta.services && Object.keys(meta.services).length > 0) || meta.body) {
        route.__meta = meta;
        routeMetadata.set(route, meta);
    }
}
