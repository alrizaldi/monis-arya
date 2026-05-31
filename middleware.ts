import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Get the auth token cookie
  const authTokenCookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0].replace("https://", "")}-auth-token`;
  const authTokenCookie = req.cookies.get(authTokenCookieName);

  // Debug: Log all cookies to see what we're getting
  const allCookies = req.cookies.getAll();
  // console.log(
  //   "Middleware - All cookies:",
  //   allCookies.map((c) => ({ name: c.name, valueLength: c.value.length })),
  // );

  // console.log("Middleware - Auth token cookie exists:", !!authTokenCookie);
  // console.log("Middleware - Auth cookie name:", authTokenCookieName);

  let user = null;
  let error = null;

  // If auth token cookie exists, try to extract the access token
  if (authTokenCookie?.value) {
    try {
      const authData = JSON.parse(authTokenCookie.value);
      // console.log("Middleware - Auth data parsed successfully");
      // console.log("Middleware - Access token exists:", !!authData.access_token);
      // console.log("Middleware - User in auth data:", !!authData.user);

      if (authData.user) {
        user = authData.user;
        // console.log("Middleware - User extracted from cookie:", user.email);
      }

      // If we have an access token but no user in the cookie, try getUser()
      if (!user && authData.access_token) {
        // console.log("Middleware - No user in cookie, trying getUser()");

        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return req.cookies.getAll();
              },
              setAll(cookiesToSet: any[]) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  res.cookies.set(name, value, options);
                });
              },
            },
          },
        );

        const { data, error: getUserError } = await supabase.auth.getUser();
        if (data?.user) {
          user = data.user;
          // console.log("Middleware - User retrieved via getUser():", user.email);
        } else {
          error = getUserError;
          // console.log("Middleware - getUser() error:", error?.message);
        }
      }
    } catch (e) {
      // console.log("Middleware - Failed to parse auth cookie:", e);
      error = new Error("Failed to parse auth cookie");
    }
  } else {
    // console.log("Middleware - No auth token cookie found");
  }

  // Add logging to debug authentication state
  // console.log("Middleware - Request URL:", req.url);
  // console.log(
  //   "Middleware - User status:",
  //   user ? "authenticated" : "unauthenticated",
  // );
  // console.log("Middleware - User email:", user?.email);
  // console.log("Middleware - Error:", error?.message);

  // Check if the current path is a protected route
  // Exclude PDF routes from authentication since they are standalone pages for printing/exporting
  const isPdfRoute = req.nextUrl.pathname.startsWith("/pdf/report/");
  const protectedPaths = [
    "/dashboard",
    "/patients",
    "/rooms",
    "/payers",
    "/submissions", // This includes /submissions/* but excludes /pdf/report/*
    "/pending",
    "/audit",
  ];
  const isProtectedRoute =
    !isPdfRoute &&
    protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !user) {
    // Log the redirect
    // console.log("Middleware - Redirecting to login due to no user");

    // Redirect to login page
    const redirectTo = req.nextUrl.clone();
    redirectTo.pathname = "/login";
    return NextResponse.redirect(redirectTo);
  }

  // Log successful access
  if (isProtectedRoute && user) {
    // console.log(
    //   "Middleware - Access granted to protected route for user:",
    //   user.email,
    // );
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/rooms/:path*",
    "/payers/:path*",
    "/submissions/:path*",
    "/pending/:path*",
    "/audit/:path*",
  ],
};
