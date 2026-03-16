import { NextResponse } from "next/server";

export async function POST(request) {
  // Simple logout - just redirect, no session to clear
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
