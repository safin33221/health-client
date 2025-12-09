import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';



export async function proxy(request: NextRequest) {
    const pathName = request.nextUrl.pathname;
    const cookieStore = await cookies();
    const accessToken = request.cookies.get("accessToken")?.value;

    let userRole: UserRole | null = null;

    if (accessToken) {
        try {
            const verified = jwt.verify(
                accessToken,
                process.env.jwt_SECRET as string
            ) as JwtPayload;

            if (!verified || typeof verified === "string") {
                cookieStore.delete("accessToken");
                cookieStore.delete("refreshToken");
                return NextResponse.redirect(new URL("/login", request.url));
            }

            userRole = verified.role as UserRole    ;
        } catch {
            cookieStore.delete("accessToken");
            cookieStore.delete("refreshToken");
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    const routeOwner = getRouteOwner(pathName);
    const authPath = isAuthRoute(pathName);

    // Logged in users must not see login/register pages
    if (accessToken && authPath) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
        );
    }

    // Protected route but no token → redirect with redirect param
    if (routeOwner && !accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathName);
        return NextResponse.redirect(loginUrl);
    }

    // Public route
    if (routeOwner === null) {
        return NextResponse.next();
    }

    // Common protected route (role not required)
    if (routeOwner === "COMMON") {
        return NextResponse.next();
    }

    // Role-based authorization
    if (
        (routeOwner === "ADMIN" ||
            routeOwner === "PATIENT" ||
            routeOwner === "DOCTOR") &&
        userRole !== routeOwner
    ) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
};
