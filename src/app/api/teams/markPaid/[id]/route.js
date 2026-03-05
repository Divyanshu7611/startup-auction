import { NextResponse } from "next/server";

import { getPaymentSuccessEmail } from "@/lib/emailTemplates";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

function getAppBaseUrl(request) {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "";
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const teamId = BigInt(id);

    const updatedCount = await prisma.teams.updateMany({
      where: { team_id: teamId, payment_status: false },
      data: { payment_status: true },
    });

    const team = await prisma.teams.findUnique({
      where: { team_id: teamId },
      select: {
        team_id: true,
        payment_status: true,
        captain_email: true,
        captain_name: true,
        team_name: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (updatedCount.count > 0) {
      const baseUrl = getAppBaseUrl(request);
      const dashboardUrl = baseUrl
        ? `${baseUrl}/team/dashboard?teamId=${String(team.team_id)}`
        : `/team/dashboard?teamId=${String(team.team_id)}`;

      const { subject, html, text } = getPaymentSuccessEmail({
        captain_name: team.captain_name,
        team_name: team.team_name,
        dashboard_url: dashboardUrl,
      });

      sendMail({
        to: team.captain_email,
        subject,
        html,
        text,
      }).catch((mailError) => {
        console.error("Payment success email failed:", mailError);
      });
    }

    return NextResponse.json(
      {
        message: updatedCount.count > 0 ? "Payment status updated" : "Payment already marked as completed",
        team_id: String(team.team_id),
        payment_status: team.payment_status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
