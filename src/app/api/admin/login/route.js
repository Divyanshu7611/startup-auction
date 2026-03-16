import { NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Direct validation without sessions
    if (!validateAdminCredentials(userId, password)) {
      return NextResponse.json({ error: "Invalid user ID or password" }, { status: 401 });
    }

    return NextResponse.json({ 
      message: "Admin login successful",
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
