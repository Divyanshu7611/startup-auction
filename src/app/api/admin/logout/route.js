import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, getAdminCookieOptions } from "@/lib/adminAuth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });

  return response;
}
