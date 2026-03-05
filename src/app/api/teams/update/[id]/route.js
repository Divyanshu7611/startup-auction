import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function normalizeMembers(input) {
  if (!Array.isArray(input)) return [];

  return input
    .slice(0, 3)
    .map((member) => ({
      name: typeof member?.name === "string" ? member.name.trim() : "",
      roll_number:
        typeof member?.roll_number === "string" ? member.roll_number.trim() : "",
      contact_number:
        typeof member?.contact_number === "string" ? member.contact_number.trim() : "",
    }))
    .filter((member) => member.name || member.roll_number || member.contact_number);
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const {
      captain_email,
      captain_name,
      contact_number,
      captain_roll_number,
      team_members,
    } = body || {};

    if (!captain_email || typeof captain_email !== "string") {
      return NextResponse.json(
        { error: "Captain email is required for update" },
        { status: 400 }
      );
    }

    const teamId = BigInt(id);
    const existing = await prisma.teams.findUnique({
      where: { team_id: teamId },
      select: {
        team_id: true,
        captain_email: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (existing.captain_email !== captain_email) {
      return NextResponse.json(
        { error: "Only captain can update team details" },
        { status: 403 }
      );
    }

    const updated = await prisma.teams.update({
      where: { team_id: teamId },
      data: {
        captain_name:
          typeof captain_name === "string" && captain_name.trim()
            ? captain_name.trim()
            : undefined,
        contact_number:
          typeof contact_number === "string" && contact_number.trim()
            ? contact_number.trim()
            : undefined,
        captain_roll_number:
          typeof captain_roll_number === "string"
            ? captain_roll_number.trim()
            : undefined,
        team_members:
          team_members !== undefined ? normalizeMembers(team_members) : undefined,
      },
    });

    return NextResponse.json(
      { ...updated, team_id: String(updated.team_id) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
