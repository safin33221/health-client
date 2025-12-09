/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { z } from "zod";
import { parse } from 'cookie';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from 'next/server';
import { isValidRedirectForRole } from '@/lib/auth-utils';
const loginZodValidation = z.object({
    email: z
        .email("Invalid email address"),
    password: z
        .string()
        .min(4, "Password must be at least 4 characters")
        .max(50, "Password must be less than 50 characters"),
});

export const loginUser = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const redirectTo = formData.get("redirect") || null

        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        const loginData = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        const validatedFields = loginZodValidation.safeParse(loginData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            };
        }

        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json",
            }
        })



        const setCookieHeader = res.headers.getSetCookie();
        if (setCookieHeader && setCookieHeader.length > 0) {
            setCookieHeader.forEach((cookie: string) => {
                const parsedCookie = parse(cookie)
                if (parsedCookie.accessToken) {
                    accessTokenObject = parsedCookie
                }
                else if (parsedCookie.refreshToken) {
                    refreshTokenObject = parsedCookie
                }
            })
        } else {
            throw new Error("No set Cookie header found")
        }
        if (!accessTokenObject) {
            throw new Error("Access Token not found")
        }
        if (!refreshTokenObject) {
            throw new Error("Refresh Token not found")
        }

        const cookiesStore = await cookies()
        cookiesStore.set("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
            path: accessTokenObject.path || '/',
            sameSite: accessTokenObject['sameSite'] || "none"

        })
        cookiesStore.set("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.path || '/',
            sameSite: refreshTokenObject['sameSite'] || "none"
        })

        const verified = jwt.verify(
            accessTokenObject.accessToken,
            process.env.jwt_SECRET as string
        ) as JwtPayload;

        if (!verified || typeof verified === "string") {
            throw Error("Invalid Token")

        }
        type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
        const getDefaultDashboardRoute = (role: UserRole) => {
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
        const userRole: UserRole = verified.role;

        if (redirectTo) {
            const requestPath = redirectTo.toString();


            if (isValidRedirectForRole(requestPath, userRole)) {
                redirect(requestPath)
            } else {
                redirect(getDefaultDashboardRoute(userRole));
            }
        }



        // return result;
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        console.log(error);
        return { success: false, errors: [{ field: "server", message: "Login failed" }] };
    }
};
