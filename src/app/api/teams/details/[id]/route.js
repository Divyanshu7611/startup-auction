import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSerializableNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function serializeStartup(startup) {
  return {
    startup_id: startup.startup_id.toString(),
    name: startup.name,
    sector: startup.sector,
    risk_level: startup.risk_level,
    growth_rate: startup.growth_rate,
    base_price: toSerializableNumber(startup.base_price),
    current_price: toSerializableNumber(startup.current_price),
    status: startup.status,
    created_at: startup.created_at,
  };
}

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to view team details" }, { status: 401 });
    }
    if (session.team_id !== id) {
      return NextResponse.json(
        { error: "You do not have access to this team's details" },
        { status: 403 }
      );
    }

    const team = await prisma.teams.findUnique({
      where: { team_id: BigInt(id) },
      select: {
        team_id: true,
        team_name: true,
        wallet: true,
        reserved_amount: true,
        final_portfolio_value: true,
        payment_status: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const soldStartups = await prisma.startups.findMany({
      where: {
        owner_team_id: BigInt(id),
        status: "sold",
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        startup_id: true,
        name: true,
        sector: true,
        risk_level: true,
        growth_rate: true,
        base_price: true,
        current_price: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        team: {
          team_id: team.team_id.toString(),
          team_name: team.team_name,
          wallet: toSerializableNumber(team.wallet),
          reserved_amount: toSerializableNumber(team.reserved_amount),
          final_portfolio_value: toSerializableNumber(team.final_portfolio_value),
          payment_status: team.payment_status,
        },
        sold_startups: soldStartups.map(serializeStartup),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
