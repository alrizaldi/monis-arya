import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            // Setting the cookie on the response
            res.cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
    }
  );

  // Get the session to ensure authentication state is updated
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  // If there's an error or no session for protected routes, redirect to login
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
  
  if (isProtectedRoute && !session && !error) {
    // Redirect to login page
    const redirectTo = req.nextUrl.clone();
    redirectTo.pathname = '/login';
    return NextResponse.redirect(redirectTo);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/patients/:path*', '/rooms/:path*', '/payers/:path*', '/submissions/:path*', '/pending/:path*', '/audit/:path*'],
};