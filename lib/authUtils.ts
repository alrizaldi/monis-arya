import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Helper function to get authenticated user from request in server components
export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
}

// Helper function to create Supabase client for API routes
export function createSupabaseClient(request: NextRequest) {
  // Get all cookies from the request and format them properly for Supabase
  const requestCookies = request.cookies.getAll();
  
  // Convert the cookies to the format expected by Supabase
  const supabaseCookies = requestCookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
  }));
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return supabaseCookies;
        },
        setAll(_cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // We don't set cookies in API routes, just read them
        },
      },
    }
  );
  
  return supabase;
}

// Helper function to get authenticated user from request in API routes
export async function getUserFromRequest(request: NextRequest) {
  try {
    // First, try to get the user using the standard Supabase client approach
    const supabase = createSupabaseClient(request);
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('Warning: Could not get user from request using standard method:', error?.message || error);
      // Log the available cookies for debugging
      console.log('Available cookies in request:', request.cookies.getAll().map(c => c.name));
      
      // As a fallback, try to manually extract user info from auth token cookie
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const urlParts = supabaseUrl.replace('https://', '').split('.');
        const projectId = urlParts[0];
        const authCookieName = `sb-${projectId}-auth-token`;
        
        const authCookie = request.cookies.get(authCookieName);
        if (authCookie) {
          try {
            const authData = JSON.parse(authCookie.value);
            if (authData?.user) {
              console.log('Successfully extracted user from auth cookie');
              return authData.user;
            }
          } catch (parseError) {
            console.error('Error parsing auth cookie:', parseError);
          }
        }
      }
      
      return null;
    }
    
    if (!user) {
      console.warn('Warning: No user found in session');
      // Try the same fallback as above
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const urlParts = supabaseUrl.replace('https://', '').split('.');
        const projectId = urlParts[0];
        const authCookieName = `sb-${projectId}-auth-token`;
        
        const authCookie = request.cookies.get(authCookieName);
        if (authCookie) {
          try {
            const authData = JSON.parse(authCookie.value);
            if (authData?.user) {
              console.log('Successfully extracted user from auth cookie');
              return authData.user;
            }
          } catch (parseError) {
            console.error('Error parsing auth cookie:', parseError);
          }
        }
      }
      return null;
    }
    
    return user;
  } catch (error: any) {
    console.warn('Warning: Exception getting user from request:', error?.message || error);
    // Log the available cookies for debugging
    console.log('Available cookies in request:', request.cookies.getAll().map(c => c.name));
    
    // Try to extract user from auth token cookie as fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const urlParts = supabaseUrl.replace('https://', '').split('.');
      const projectId = urlParts[0];
      const authCookieName = `sb-${projectId}-auth-token`;
      
      const authCookie = request.cookies.get(authCookieName);
      if (authCookie) {
        try {
          const authData = JSON.parse(authCookie.value);
          if (authData?.user) {
            console.log('Successfully extracted user from auth cookie as fallback');
            return authData.user;
          }
        } catch (parseError) {
          console.error('Error parsing auth cookie in catch block:', parseError);
        }
      }
    }
    
    return null;
  }
}