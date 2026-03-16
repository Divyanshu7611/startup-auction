import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object" && typeof value.toString === "function") {
    return Number(value.toString());
  }
  return Number(value);
}

function toStringId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value.toString();
  return String(value);
}

function serializeLiveAuction(row) {
  if (!row) return null;
  return {
    auction_id: toStringId(row.auction_id),
    startup_id: toStringId(row.startup_id),
    startup_name: row.startup_name,
    base_price: toNumber(row.base_price),
    current_price: toNumber(row.current_price),
    bid_amount: toNumber(row.bid_amount ?? row.current_price),
    highest_bid: toNumber(row.highest_bid),
    highest_bidder: toStringId(row.highest_bidder),
    highest_bidder_name: row.highest_bidder_name ?? null,
    start_time: row.start_time,
    end_time: row.end_time,
  };
}

function serializeTeam(team) {
  const wallet = toNumber(team.wallet);
  const reservedAmount = toNumber(team.reserved_amount);
  return {
    team_id: toStringId(team.team_id),
    team_name: team.team_name,
    wallet,
    reserved_amount: reservedAmount,
    remaining_amount: wallet - reservedAmount,
  };
}

function serializeSoldStartup(row) {
  if (!row) return null;
  return {
    startup_id: toStringId(row.startup_id),
    startup_name: row.startup_name,
    final_price: toNumber(row.final_price ?? row.current_price),
    owner_team_id: toStringId(row.owner_team_id),
    owner_team_name: row.owner_team_name ?? null,
    sold_at: row.sold_at ?? null,
  };
}

export async function GET() {
  try {
    const [liveRows, teamRows, soldRows] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          a.auction_id,
          s.startup_id,
          s.name AS startup_name,
          s.base_price,
          s.current_price,
          a.bid_amount,
          a.highest_bid,
          a.highest_bidder,
          a.start_time,
          a.end_time,
          t.team_name AS highest_bidder_name
        FROM startups s
        JOIN auctions a ON a.startup_id = s.startup_id
        LEFT JOIN teams t ON t.team_id = a.highest_bidder
        WHERE s.status = 'live' AND a.end_time IS NULL
        ORDER BY a.auction_id DESC
        LIMIT 1
      `,
      prisma.$queryRaw`
        SELECT team_id, team_name, wallet, reserved_amount
        FROM teams
        ORDER BY team_name ASC
      `,
      prisma.$queryRaw`
        SELECT
          s.startup_id,
          s.name AS startup_name,
          s.current_price AS current_price,
          s.owner_team_id,
          t.team_name AS owner_team_name,
          a.end_time AS sold_at,
          a.highest_bid AS final_price
        FROM startups s
        LEFT JOIN teams t ON t.team_id = s.owner_team_id
        LEFT JOIN LATERAL (
          SELECT end_time, highest_bid
          FROM auctions a
          WHERE a.startup_id = s.startup_id AND a.end_time IS NOT NULL
          ORDER BY a.end_time DESC
          LIMIT 1
        ) a ON true
        WHERE s.status = 'sold'
        ORDER BY a.end_time DESC NULLS LAST, s.name ASC
      `,
    ]);

    return NextResponse.json(
      {
        liveAuction: serializeLiveAuction(liveRows[0]),
        teams: teamRows.map(serializeTeam),
        soldStartups: soldRows.map(serializeSoldStartup).filter(Boolean),
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load battleground data:", error);
    return NextResponse.json({ error: "Failed to load battleground data" }, { status: 500 });
  }
}
