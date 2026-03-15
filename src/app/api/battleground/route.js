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

export async function GET() {
  try {
    const [liveRows, teamRows] = await Promise.all([
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
    ]);

    return NextResponse.json(
      {
        liveAuction: serializeLiveAuction(liveRows[0]),
        teams: teamRows.map(serializeTeam),
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load battleground data:", error);
    return NextResponse.json({ error: "Failed to load battleground data" }, { status: 500 });
  }
}
