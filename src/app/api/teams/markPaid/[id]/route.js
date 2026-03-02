import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const updated = await prisma.teams.update({
      where: { team_id: BigInt(id) },
      data: { payment_status: true },
      select: {
        team_id: true,
        payment_status: true,
      },
    });

    return NextResponse.json(
      {
        message: "Payment status updated",
        team_id: String(updated.team_id),
        payment_status: updated.payment_status,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    console.error("Error updating payment status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
