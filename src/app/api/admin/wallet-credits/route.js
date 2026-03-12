import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

function isAdminAuthorized(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const adminSession = verifyAdminSessionToken(token);
  return Boolean(adminSession);
}

function parseCreditAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  if (amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const creditAmount = parseCreditAmount(payload?.amount);

    if (creditAmount === null) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const result = await prisma.teams.updateMany({
      data: {
        wallet: {
          increment: creditAmount,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Wallet credits released successfully",
        amount: creditAmount,
        teamsUpdated: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to release wallet credits:", error);

    return NextResponse.json(
      { error: "Failed to release wallet credits" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.teams.updateMany({
      data: {
        wallet: 0,
      },
    });

    return NextResponse.json(
      {
        message: "Wallet credits reset successfully",
        teamsUpdated: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to reset wallet credits:", error);

    return NextResponse.json(
      { error: "Failed to reset wallet credits" },
      { status: 500 }
    );
  }
}
