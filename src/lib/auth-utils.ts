import { redirect } from "next/dist/server/api-utils";

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export type RoutesConfig = {
    exact: string[];
    patterns: RegExp[];
};

export const authRoute = ['/login', '/register', '/forget-password', '/reset-password'];

export const commonProtectedRoute: RoutesConfig = {
    exact: ['/my-profile', '/setting'],
    patterns: []
};

export const doctorProtectedRoute: RoutesConfig = {
    exact: [],
    patterns: [/^\/doctor/]
};

export const adminProtectedRoute: RoutesConfig = {
    exact: [],
    patterns: [/^\/admin/]
};

export const patientProtectedRoute: RoutesConfig = {
    exact: [],
    patterns: [/^\/dashboard/]
};

export const isAuthRoute = (pathName: string) => {
    return authRoute.some(route => route === pathName);
};

export const isRouteMatches = (pathName: string, routes: RoutesConfig) => {
    if (routes.exact.includes(pathName)) return true;
    return routes.patterns.some(pattern => pattern.test(pathName));
};

export const getRouteOwner = (
    pathName: string
): "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
    if (isRouteMatches(pathName, adminProtectedRoute)) return "ADMIN";
    if (isRouteMatches(pathName, doctorProtectedRoute)) return "DOCTOR";
    if (isRouteMatches(pathName, patientProtectedRoute)) return "PATIENT";
    if (isRouteMatches(pathName, commonProtectedRoute)) return "COMMON";
    return null;
};

export const getDefaultDashboardRoute = (role: UserRole) => {
    switch (role) {
        case "ADMIN":
            return '/admin/dashboard';
        case "DOCTOR":
            return '/doctor/dashboard';
        case "PATIENT":
            return '/dashboard';
        default:
            return '/login';
    }
};

export const isValidRedirectForRole = (redirect: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirect);
    if (routeOwner === null || routeOwner === "COMMON") return true;
    if (routeOwner === role) {
        return true;
    }
    return false

}