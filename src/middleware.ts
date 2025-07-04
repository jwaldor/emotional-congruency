import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication or access codes
const protectedRoutes = ["/history", "/account"];
const publicRoutes = ["/", "/login", "/pricing"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Allow public routes without any checks
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return response;
  }

  // Check for user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is authenticated, allow access to protected routes
  if (session) {
    return response;
  }

  // For protected routes, check if there's a valid access code
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const accessCode = request.nextUrl.searchParams.get("accessCode");

    if (accessCode) {
      // Validate the access code
      const isValidCode = await validateAccessCode(accessCode);
      if (isValidCode) {
        return response;
      }
    }

    // No valid session or access code, redirect to login
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For the main app (results pages, etc.), check for access code if no session
  const accessCode = request.nextUrl.searchParams.get("accessCode");
  if (accessCode) {
    const isValidCode = await validateAccessCode(accessCode);
    if (isValidCode) {
      return response;
    }
  }

  // If no session and no valid access code for non-public routes, redirect to login
  if (!publicRoutes.includes(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

async function validateAccessCode(code: string): Promise<boolean> {
  try {
    // Make a request to our API to validate the access code
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/access_codes?code=eq.${code}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const codes = await response.json();
    if (codes.length === 0) {
      return false;
    }

    const accessCode = codes[0];

    // Check if code is expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return false;
    }

    // Check if code has reached max uses
    if (accessCode.current_uses >= accessCode.max_uses) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating access code:", error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
