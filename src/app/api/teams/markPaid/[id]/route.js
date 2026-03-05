import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { getPaymentReceiptEmail } from "@/lib/emailTemplates";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

function normalizeTeamMembers(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to complete payment" }, { status: 401 });
    }
    if (session.team_id !== id) {
      return NextResponse.json({ error: "You can only complete payment for your own team" }, { status: 403 });
    }

    const updated = await prisma.teams.update({
      where: { team_id: BigInt(id) },
      data: { payment_status: true },
      select: {
        team_id: true,
        payment_status: true,
      },
    });

    // Send payment receipt email to captain (non-blocking)
    try {
      const team = await prisma.teams.findUnique({
        where: { team_id: BigInt(id) },
        select: {
          captain_name: true,
          captain_email: true,
          team_name: true,
          team_members: true,
        },
      });
      if (team?.captain_email) {
        const members = normalizeTeamMembers(team.team_members).map((m) => ({
          name: m?.name ?? m?.member_name ?? "",
          roll_number: m?.roll_number ?? m?.roll ?? "",
          contact_number: m?.contact_number ?? m?.contact ?? "",
        }));
        const paymentDate = new Date().toLocaleDateString("en-IN", {
          dateStyle: "long",
          timeZone: "Asia/Kolkata",
        });
        const { subject, html, text } = getPaymentReceiptEmail({
          captain_name: team.captain_name,
          captain_email: team.captain_email,
          team_name: team.team_name,
          team_id: id,
          team_members: members,
          amount: "₹1",
          payment_date: paymentDate,
        });
        await sendMail({
          to: team.captain_email,
          subject,
          text,
          html,
        });
      }
    } catch (mailError) {
      console.error("Payment receipt email failed:", mailError);
    }

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
