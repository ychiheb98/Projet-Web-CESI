import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/auth"];
const MFA_CHALLENGE_PATH = "/login/mfa";

// Refreshes the Supabase auth cookie on every request, redirects signed-out
// users to /login, and — this is the part that actually enforces two-factor
// auth rather than just offering it in Settings — forces any session that
// has a verified TOTP factor but hasn't completed it this session (aal1,
// with aal2 available) through /login/mfa before it can reach anything else.
// Without this check here, a password alone would be enough to reach
// protected routes even with MFA "enabled".
// Runs in proxy.ts (Next.js 16's renamed middleware).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublic) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === MFA_CHALLENGE_PATH && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    // Cheap: decodes the already-fetched session locally, no extra request.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const needsMfaStepUp = !!aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel;

    if (needsMfaStepUp && pathname !== MFA_CHALLENGE_PATH) {
      return NextResponse.redirect(new URL(MFA_CHALLENGE_PATH, request.url));
    }

    if (!needsMfaStepUp && (pathname === "/login" || pathname === "/signup" || pathname === MFA_CHALLENGE_PATH)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
