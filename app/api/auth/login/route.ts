import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  let res = NextResponse.json({ success: false }, { status: 200 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.session) {
    return NextResponse.json({ error: "No session returned" }, { status: 400 });
  }

  // Update response with success
  res = NextResponse.json(
    {
      success: true,
      user: data.user,
    },
    { status: 200 },
  );

  // Re-set cookies in the new response
  data.session?.user &&
    req.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("sb-")) {
        res.cookies.set(cookie.name, cookie.value, {
          path: "/",
          maxAge: 3600,
          sameSite: "lax",
          httpOnly: true,
        });
      }
    });

  return res;
}
