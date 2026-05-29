import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Get cookies from document
          const cookies: { name: string; value: string }[] = [];
          if (typeof document === "undefined") return cookies;

          document.cookie.split(";").forEach((cookie) => {
            const [name, value] = cookie.trim().split("=");
            if (name && value) {
              cookies.push({ name, value: decodeURIComponent(value) });
            }
          });
          return cookies;
        },
        setAll(cookiesToSet: any[]) {
          if (typeof document === "undefined") return;

          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${encodeURIComponent(value)}; path=${options?.path || "/"}; max-age=${options?.maxAge || 3600}`;
            document.cookie = cookieString;
          });
        },
      },
    },
  );
}
