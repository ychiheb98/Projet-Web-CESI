import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-helper";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets, images, and the PWA/manifest/icon routes.
    "/((?!_next/static|_next/image|manifest|sw\\.js|icons/|apple-icon|icon\\.|favicon\\.ico).*)",
  ],
};
