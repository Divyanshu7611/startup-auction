import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

const ALLOWED_RISK_LEVELS = ["Low", "Medium", "High"];

function serializeStartup(startup) {
  return {
    startup_id:
      typeof startup.startup_id === "bigint" ? String(startup.startup_id) : startup.startup_id,
    name: startup.name,
    sector: startup.sector,
    revenue: startup.revenue,
    growth_rate: startup.growth_rate,
    risk_level: startup.risk_level,
    base_price: startup.base_price,
    current_price: startup.current_price,
    owner_team_id:
      typeof startup.owner_team_id === "bigint"
        ? String(startup.owner_team_id)
        : startup.owner_team_id,
    status: startup.status,
    created_at: startup.created_at,
  };
}

function validateNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isAdminAuthorized(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const adminSession = verifyAdminSessionToken(token);
  return Boolean(adminSession);
}

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startups = await prisma.$queryRaw`
      SELECT
        startup_id,
        name,
        sector,
        revenue,
        growth_rate,
        risk_level,
        base_price,
        current_price,
        owner_team_id,
        status,
        created_at
      FROM startups
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        startups: startups.map(serializeStartup),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return NextResponse.json({ error: "Failed to fetch startups" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const name = payload?.name?.trim();
    const sector = payload?.sector?.trim();
    const revenue = validateNumber(payload?.revenue);
    const growthRate = validateNumber(payload?.growth_rate);
    const riskLevel = payload?.risk_level;
    const basePrice = validateNumber(payload?.base_price);
    const currentPrice = validateNumber(payload?.current_price);

    if (!name || !sector) {
      return NextResponse.json({ error: "Name and sector are required" }, { status: 400 });
    }

    if (
      revenue === null ||
      growthRate === null ||
      basePrice === null ||
      currentPrice === null
    ) {
      return NextResponse.json(
        { error: "Revenue, growth rate, base price and current price must be valid numbers" },
        { status: 400 }
      );
    }

    if (!ALLOWED_RISK_LEVELS.includes(riskLevel)) {
      return NextResponse.json(
        { error: "Risk level must be one of: Low, Medium, High" },
        { status: 400 }
      );
    }

    const insertedRows = await prisma.$queryRaw`
      INSERT INTO startups (
        name,
        sector,
        revenue,
        growth_rate,
        risk_level,
        base_price,
        current_price,
        status
      )
      VALUES (
        ${name},
        ${sector},
        ${revenue},
        ${growthRate},
        ${riskLevel},
        ${basePrice},
        ${currentPrice},
        'available'
      )
      RETURNING
        startup_id,
        name,
        sector,
        revenue,
        growth_rate,
        risk_level,
        base_price,
        current_price,
        owner_team_id,
        status,
        created_at
    `;

    const startup = insertedRows[0];
    return NextResponse.json({ startup: serializeStartup(startup) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create startup:", error);
    return NextResponse.json({ error: "Failed to create startup" }, { status: 500 });
  }
}
