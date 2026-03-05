import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in to view the dashboard" },
        { status: 401 }
      );
    }
    if (session.team_id !== id) {
      return NextResponse.json(
        { error: "You do not have access to this team's dashboard" },
        { status: 403 }
      );
    }

    const team = await prisma.teams.findUnique({
      where: { team_id: BigInt(id) },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ...team, team_id: team.team_id.toString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}