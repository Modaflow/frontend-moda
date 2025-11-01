import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ["/dashboard", "/integrations", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // TEMPORARILY DISABLED - If accessing protected route without session, redirect to home
  // if (isProtectedRoute && !session) {
  //   console.log('Middleware: No session, redirecting to /')
  //   return NextResponse.redirect(new URL('/', req.url))
  // }

  // DEBUG: Log session status
  console.log("Middleware:", {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id,
  });

  // If logged in and accessing home, check onboarding status
  if (req.nextUrl.pathname === "/" && session) {
    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        return NextResponse.redirect(new URL("/integrations", req.url));
      }
    } catch (error) {
      // If profile doesn't exist, stay on home page for onboarding
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
