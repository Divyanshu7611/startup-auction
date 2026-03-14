import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

const ALLOWED_RISK_LEVELS = ["Low", "Medium", "High"];
const MAX_DECIMAL_14_2 = 999999999999.99;
const MAX_GROWTH_PERCENT = 100;

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

function hasMaxTwoDecimalPlaces(value) {
  return Math.abs(Math.round(value * 100) - value * 100) < 1e-9;
}

function validateDecimalRange(value, { min, max }) {
  if (!Number.isFinite(value)) return false;
  if (!hasMaxTwoDecimalPlaces(value)) return false;
  if (value < min) return false;
  if (value > max) return false;
  return true;
}

function formatPercentValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
}

function normalizeGrowthRateRange(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,3}(?:\.\d{1,2})?)\s*-\s*(\d{1,3}(?:\.\d{1,2})?)\s*%?$/);
  if (!match) {
    return null;
  }

  const start = Number(match[1]);
  const end = Number(match[2]);

  if (!validateDecimalRange(start, { min: 0, max: MAX_GROWTH_PERCENT })) return null;
  if (!validateDecimalRange(end, { min: 0, max: MAX_GROWTH_PERCENT })) return null;
  if (start > end) return null;

  return `${formatPercentValue(start)}-${formatPercentValue(end)}%`;
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
    const growthRate = normalizeGrowthRateRange(payload?.growth_rate);
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
        {
          error:
            "Revenue, base price and current price must be valid numbers, and growth rate must be in range format like 50-60%",
        },
        { status: 400 }
      );
    }

    if (
      !validateDecimalRange(revenue, { min: 0, max: MAX_DECIMAL_14_2 }) ||
      !validateDecimalRange(basePrice, { min: 0, max: MAX_DECIMAL_14_2 }) ||
      !validateDecimalRange(currentPrice, { min: 0, max: MAX_DECIMAL_14_2 })
    ) {
      return NextResponse.json(
        {
          error:
            "Revenue, base price and current price must be between 0 and 999999999999.99 with up to 2 decimal places",
        },
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

    if (error?.code === "P2010") {
      return NextResponse.json(
        { error: "Numeric value is out of range. Please reduce the amount and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create startup" }, { status: 500 });
  }
}
