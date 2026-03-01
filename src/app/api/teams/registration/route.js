import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

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

    // Validate required fields
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

    // Check existing team by email
    const existingByEmail = await prisma.teams.findUnique({
      where: { captain_email },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: "Team already exists with this email" },
        { status: 400 }
      );
    }

    // Check existing team by name
    const existingByName = await prisma.teams.findUnique({
      where: { team_name },
    });
    if (existingByName) {
      return NextResponse.json(
        { error: "Team name is already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create team
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

    return NextResponse.json(
      {
        message: "Team created successfully",
        team_id: String(newTeam.team_id),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);

    if (error?.code === "P2002") {
      const target = error?.meta?.target;
      if (Array.isArray(target) && target.includes("team_name")) {
        return NextResponse.json({ error: "Team name is already taken" }, { status: 400 });
      }
      if (Array.isArray(target) && target.includes("captain_email")) {
        return NextResponse.json({ error: "Team already exists with this email" }, { status: 400 });
      }
      return NextResponse.json({ error: "A team with this value already exists" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Invalid JSON or Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
    try {
        const teams = await prisma.teams.findMany();
        const serialized = teams.map((t) => ({
            ...t,
            team_id: String(t.team_id),
        }));
        return NextResponse.json(serialized, { status: 200 });
    } catch (error) {
        console.error("Error fetching teams:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


