import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { captain_email, password } = await request.json();

    if (!captain_email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkUser = await prisma.teams.findUnique({
      where: { captain_email },
    });

    if (!checkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password_hash);

    if (!checkPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const teamDetails = await prisma.teams.findUnique({
      where: { captain_email },
      select: {
        team_id: true,
        captain_name: true,
        captain_email: true,
        team_name: true,
        contact_number: true,
        team_members: true,
        wallet: true,
        reserved_amount: true,
        final_portfolio_value: true,
        payment_status: true,
        captain_roll_number: true,
        created_at: true,
      },
    });

    if (!teamDetails) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const payload = {
      message: "Login successful",
      teamDetails: {
        ...teamDetails,
        team_id: String(teamDetails.team_id),
      },
    };

    const response = NextResponse.json(payload, { status: 200 });

    const token = createSessionToken({
      team_id: teamDetails.team_id,
      captain_email: teamDetails.captain_email,
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
