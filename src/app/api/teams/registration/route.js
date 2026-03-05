import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { getRegistrationEmail } from "@/lib/emailTemplates";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const {
      captain_name,
      captain_email,
      password,
      team_name,
      contact_number,
      team_members,
      captain_roll_number,
    } = await request.json();

    if (
      !captain_name ||
      !captain_email ||
      !password ||
      !team_name ||
      !contact_number ||
      !captain_roll_number
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingByEmail = await prisma.teams.findUnique({
      where: { captain_email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "Team already exists with this email" },
        { status: 400 }
      );
    }

    const existingByName = await prisma.teams.findUnique({
      where: { team_name },
    });

    if (existingByName) {
      return NextResponse.json(
        { error: "Team name is already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeam = await prisma.teams.create({
      data: {
        captain_name,
        captain_email,
        password_hash: hashedPassword,
        team_name,
        contact_number,
        captain_roll_number,
        team_members: team_members || [],
      },
    });

    // Keep registration successful even if email delivery fails.
    const { subject, html, text } = getRegistrationEmail({
      captain_name,
      team_name,
      captain_email,
    });
    sendMail({
      to: captain_email,
      subject,
      text,
      html,
    }).catch((mailError) => {
      console.error("Registration email failed:", mailError);
    });

    const response = NextResponse.json(
      {
        message: "Team created successfully",
        team_id: String(newTeam.team_id),
      },
      { status: 201 }
    );

    try {
      const token = createSessionToken({
        team_id: newTeam.team_id,
        captain_email: newTeam.captain_email,
      });
      response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    } catch (sessionError) {
      console.error("Session cookie not set (SESSION_SECRET missing?):", sessionError);
    }

    return response;
  } catch (error) {
    console.error("Error creating team:", error);

    if (error?.code === "P2002") {
      const target = error?.meta?.target;
      if (Array.isArray(target) && target.includes("team_name")) {
        return NextResponse.json(
          { error: "Team name is already taken" },
          { status: 400 }
        );
      }
      if (Array.isArray(target) && target.includes("captain_email")) {
        return NextResponse.json(
          { error: "Team already exists with this email" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "A team with this value already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid JSON or Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const teams = await prisma.teams.findMany();
    const serialized = teams.map((team) => ({
      ...team,
      team_id: String(team.team_id),
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
