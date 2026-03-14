import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  getAdminCredentials,
} from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const adminCreds = getAdminCredentials();
    if (!adminCreds) {
      return NextResponse.json(
        { error: "Admin credentials are not configured on the server" },
        { status: 500 }
      );
    }

    if (userId !== adminCreds.userId || password !== adminCreds.password) {
      return NextResponse.json({ error: "Invalid user ID or password" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Admin login successful" }, { status: 200 });
    const token = createAdminSessionToken(userId);

    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, getAdminCookieOptions());
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
