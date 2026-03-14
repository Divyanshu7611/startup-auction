import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

const BID_STEP = 50000;
const TRANSACTION_OPTIONS = {
  maxWait: 10000,
  timeout: 20000,
};

function isAdminAuthorized(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const adminSession = verifyAdminSessionToken(token);
  return Boolean(adminSession);
}

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

function serializeStartup(startup) {
  return {
    startup_id: toStringId(startup.startup_id),
    name: startup.name,
    sector: startup.sector,
    base_price: toNumber(startup.base_price),
    current_price: toNumber(startup.current_price),
    status: startup.status,
    owner_team_id: toStringId(startup.owner_team_id),
  };
}

function serializeLiveAuction(row) {
  if (!row) {
    return null;
  }

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

async function getAuctionState(tx) {
  const [liveRows, availableStartups, teamRows] = await Promise.all([
    tx.$queryRaw`
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
    tx.$queryRaw`
      SELECT
        startup_id,
        name,
        sector,
        base_price,
        current_price,
        status,
        owner_team_id
      FROM startups
      WHERE status = 'available'
      ORDER BY created_at DESC
    `,
    tx.$queryRaw`
      SELECT
        team_id,
        team_name,
        wallet,
        reserved_amount
      FROM teams
      ORDER BY team_name ASC
    `,
  ]);

  return {
    liveAuction: serializeLiveAuction(liveRows[0]),
    startups: availableStartups.map(serializeStartup),
    teams: teamRows.map(serializeTeam),
  };
}

async function getAuctionLiveAndTeams(tx) {
  const [liveRows, teamRows] = await Promise.all([
    tx.$queryRaw`
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
    tx.$queryRaw`
      SELECT
        team_id,
        team_name,
        wallet,
        reserved_amount
      FROM teams
      ORDER BY team_name ASC
    `,
  ]);

  return {
    liveAuction: serializeLiveAuction(liveRows[0]),
    teams: teamRows.map(serializeTeam),
  };
}

async function getLiveAuctionForUpdate(tx) {
  const rows = await tx.$queryRaw`
    SELECT
      a.auction_id,
      a.startup_id,
      a.bid_amount,
      a.highest_bid,
      a.highest_bidder,
      s.base_price,
      s.current_price,
      s.name AS startup_name
    FROM startups s
    JOIN auctions a ON a.startup_id = s.startup_id
    WHERE s.status = 'live' AND a.end_time IS NULL
    ORDER BY a.auction_id DESC
    LIMIT 1
    FOR UPDATE OF s, a
  `;

  return rows[0] ?? null;
}

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getAuctionState(prisma);
    return NextResponse.json(state, { status: 200 });
  } catch (error) {
    console.error("Failed to load auction state:", error);
    return NextResponse.json({ error: "Failed to load auction state" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const startupId = payload?.startupId;

    if (!startupId) {
      return NextResponse.json({ error: "startupId is required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const existingLive = await tx.$queryRaw`
        SELECT startup_id
        FROM startups
        WHERE status = 'live'
        LIMIT 1
      `;

      if (existingLive.length > 0) {
        throw new Error("Another startup is already live. Stop it first.");
      }

      const startupRows = await tx.$queryRaw`
        SELECT startup_id, status, base_price
        FROM startups
        WHERE startup_id = ${BigInt(startupId)}
        LIMIT 1
        FOR UPDATE
      `;

      const startup = startupRows[0];
      if (!startup) {
        throw new Error("Startup not found");
      }

      if (startup.status !== "available") {
        throw new Error("Only available startups can be made live");
      }

      const basePrice = toNumber(startup.base_price);

      await tx.$executeRaw`
        UPDATE startups
        SET status = 'live', current_price = ${basePrice}
        WHERE startup_id = ${BigInt(startupId)}
      `;

      await tx.$executeRaw`
        INSERT INTO auctions (
          startup_id,
          start_time,
          end_time,
          highest_bid,
          highest_bidder,
          bid_amount
        )
        VALUES (
          ${BigInt(startupId)},
          NOW(),
          NULL,
          0,
          NULL,
          ${basePrice}
        )
      `;

    }, TRANSACTION_OPTIONS);

    const state = await getAuctionState(prisma);
    return NextResponse.json(state, { status: 200 });
  } catch (error) {
    console.error("Failed to start auction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start auction" },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const action = payload?.action;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    if (action === "bid") {
      const direction = payload?.direction;
      const teamId = payload?.teamId;

      if (!["plus", "minus"].includes(direction)) {
        return NextResponse.json({ error: "direction must be plus or minus" }, { status: 400 });
      }

      if (!teamId) {
        return NextResponse.json({ error: "teamId is required" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const liveAuction = await getLiveAuctionForUpdate(tx);
        if (!liveAuction) {
          throw new Error("No live startup found");
        }

        const auctionId = BigInt(liveAuction.auction_id);
        const liveStartupId = BigInt(liveAuction.startup_id);

        const currentBid = toNumber(liveAuction.bid_amount || liveAuction.current_price);
        const basePrice = toNumber(liveAuction.base_price);
        const previousHighestBid = toNumber(liveAuction.highest_bid);
        const previousHighestBidder = liveAuction.highest_bidder
          ? BigInt(liveAuction.highest_bidder)
          : null;
        const requestedTeamId = BigInt(teamId);

        const teamRows = await tx.$queryRaw`
          SELECT team_id, wallet, reserved_amount
          FROM teams
          WHERE team_id = ${requestedTeamId}
          LIMIT 1
          FOR UPDATE
        `;

        const team = teamRows[0];
        if (!team) {
          throw new Error("Team not found");
        }

        const teamWallet = toNumber(team.wallet);
        const teamReserved = toNumber(team.reserved_amount);
        const teamRemaining = teamWallet - teamReserved;

        if (direction === "plus") {
          const newBid = currentBid + BID_STEP;

          if (previousHighestBidder && previousHighestBidder === requestedTeamId) {
            if (teamRemaining < BID_STEP) {
              throw new Error("Team has insufficient remaining amount for this bid");
            }

            await tx.$executeRaw`
              UPDATE teams
              SET reserved_amount = reserved_amount + ${BID_STEP}
              WHERE team_id = ${requestedTeamId}
            `;
          } else {
            if (teamRemaining < newBid) {
              throw new Error("Team has insufficient remaining amount for this bid");
            }

            if (previousHighestBidder && previousHighestBid > 0) {
              await tx.$executeRaw`
                UPDATE teams
                SET reserved_amount = GREATEST(reserved_amount - ${previousHighestBid}, 0)
                WHERE team_id = ${previousHighestBidder}
              `;
            }

            await tx.$executeRaw`
              UPDATE teams
              SET reserved_amount = reserved_amount + ${newBid}
              WHERE team_id = ${requestedTeamId}
            `;
          }

          await tx.$executeRaw`
            UPDATE auctions
            SET
              highest_bid = ${newBid},
              highest_bidder = ${requestedTeamId},
              bid_amount = ${newBid}
            WHERE auction_id = ${auctionId}
          `;

          await tx.$executeRaw`
            UPDATE startups
            SET current_price = ${newBid}
            WHERE startup_id = ${liveStartupId}
          `;
        }

        if (direction === "minus") {
          if (!previousHighestBidder || previousHighestBidder !== requestedTeamId) {
            throw new Error("Only the current highest bidder can decrease the bid");
          }

          const newBid = currentBid - BID_STEP;
          if (newBid < basePrice) {
            throw new Error("Bid cannot go below base price");
          }

          await tx.$executeRaw`
            UPDATE teams
            SET reserved_amount = GREATEST(reserved_amount - ${BID_STEP}, 0)
            WHERE team_id = ${requestedTeamId}
          `;

          await tx.$executeRaw`
            UPDATE auctions
            SET
              highest_bid = ${newBid},
              highest_bidder = ${requestedTeamId},
              bid_amount = ${newBid}
            WHERE auction_id = ${auctionId}
          `;

          await tx.$executeRaw`
            UPDATE startups
            SET current_price = ${newBid}
            WHERE startup_id = ${liveStartupId}
          `;
        }

      }, TRANSACTION_OPTIONS);

      const state = await getAuctionLiveAndTeams(prisma);
      return NextResponse.json(state, { status: 200 });
    }

    if (action === "sell") {
      await prisma.$transaction(async (tx) => {
        const liveAuction = await getLiveAuctionForUpdate(tx);
        if (!liveAuction) {
          throw new Error("No live startup found");
        }

        const auctionId = BigInt(liveAuction.auction_id);
        const liveStartupId = BigInt(liveAuction.startup_id);

        const highestBidder = liveAuction.highest_bidder
          ? BigInt(liveAuction.highest_bidder)
          : null;
        const finalPrice = toNumber(liveAuction.highest_bid || liveAuction.bid_amount);

        if (!highestBidder) {
          throw new Error("Cannot sell startup without a bidder");
        }

        const bidderRows = await tx.$queryRaw`
          SELECT team_id, wallet, reserved_amount
          FROM teams
          WHERE team_id = ${highestBidder}
          LIMIT 1
          FOR UPDATE
        `;

        const bidder = bidderRows[0];
        if (!bidder) {
          throw new Error("Winning team not found");
        }

        const walletAmount = toNumber(bidder.wallet);
        if (walletAmount < finalPrice) {
          throw new Error("Winning team does not have enough wallet amount");
        }

        await tx.$executeRaw`
          UPDATE teams
          SET
            wallet = wallet - ${finalPrice},
            reserved_amount = 0
          WHERE team_id = ${highestBidder}
        `;

        await tx.$executeRaw`
          UPDATE teams
          SET reserved_amount = 0
          WHERE team_id <> ${highestBidder}
        `;

        await tx.$executeRaw`
          UPDATE startups
          SET
            status = 'sold',
            owner_team_id = ${highestBidder},
            current_price = ${finalPrice}
          WHERE startup_id = ${liveStartupId}
        `;

        await tx.$executeRaw`
          UPDATE auctions
          SET end_time = NOW(), bid_amount = ${finalPrice}, highest_bid = ${finalPrice}
          WHERE auction_id = ${auctionId}
        `;

      }, TRANSACTION_OPTIONS);

      const state = await getAuctionState(prisma);
      return NextResponse.json(state, { status: 200 });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update auction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update auction" },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const liveAuction = await getLiveAuctionForUpdate(tx);
      if (!liveAuction) {
        throw new Error("No live startup found");
      }

      const auctionId = BigInt(liveAuction.auction_id);

      const highestBidder = liveAuction.highest_bidder
        ? BigInt(liveAuction.highest_bidder)
        : null;
      const highestBid = toNumber(liveAuction.highest_bid);
      const startupId = BigInt(liveAuction.startup_id);
      const basePrice = toNumber(liveAuction.base_price);

      await tx.$executeRaw`
        UPDATE teams
        SET reserved_amount = 0
      `;

      await tx.$executeRaw`
        UPDATE startups
        SET status = 'available', current_price = ${basePrice}
        WHERE startup_id = ${startupId} AND status = 'live'
      `;

      await tx.$executeRaw`
        UPDATE auctions
        SET end_time = NOW()
        WHERE auction_id = ${auctionId}
      `;

    }, TRANSACTION_OPTIONS);

    const state = await getAuctionState(prisma);
    return NextResponse.json(state, { status: 200 });
  } catch (error) {
    console.error("Failed to stop auction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop auction" },
      { status: 400 }
    );
  }
}
