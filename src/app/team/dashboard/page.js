"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function normalizeMembers(value) {
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

function getMemberName(member) {
  if (typeof member === "string") return member;
  if (member && typeof member === "object") {
    return member.name || member.member_name || "Unnamed member";
  }
  return "Unnamed member";
}

function getMemberMeta(member) {
  if (!member || typeof member !== "object") return "";
  const parts = [];
  if (member.roll_number) parts.push(`Roll: ${member.roll_number}`);
  if (member.contact_number) parts.push(`Contact: ${member.contact_number}`);
  return parts.join(" | ");
}

function TeamDashboardContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(null);

  useEffect(() => {
    async function loadTeam() {
      if (!teamId) {
        setError("Missing teamId in URL. Open /team/dashboard?teamId=YOUR_ID");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/teams/getTeamById/${teamId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load team");
        setTeam(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamId]);

  const members = useMemo(() => normalizeMembers(team?.team_members), [team]);
  const paymentPending = team && !team.payment_status;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-700">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-6 text-red-700">
          <p className="font-semibold">Unable to load team dashboard</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className={`mx-auto max-w-5xl ${paymentPending ? "blur-sm pointer-events-none select-none" : ""}`}>
        <header className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Team Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{team.team_name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Payment status:{" "}
            <span className={`font-semibold ${team.payment_status ? "text-emerald-700" : "text-amber-700"}`}>
              {team.payment_status ? "Completed" : "Pending"}
            </span>
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Captain Details</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Name:</span> {team.captain_name}</p>
              <p><span className="font-semibold">Email:</span> {team.captain_email}</p>
              <p><span className="font-semibold">Contact:</span> {team.contact_number}</p>
              <p><span className="font-semibold">Roll Number:</span> {team.captain_roll_number || "N/A"}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
            {members.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {members.map((member, index) => (
                  <li key={`${getMemberName(member)}-${index}`} className="rounded-md border border-slate-200 px-3 py-2">
                    <p className="font-medium text-slate-800">{getMemberName(member)}</p>
                    {getMemberMeta(member) ? <p className="mt-1 text-xs text-slate-600">{getMemberMeta(member)}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No team members added yet.</p>
            )}
          </div>
        </section>
      </div>

      {paymentPending ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900">Payment Required</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your payment is pending. Complete payment to fully access your team dashboard.
            </p>
            <Link
              href={teamId ? `/payment?teamId=${teamId}` : "/payment"}
              className="mt-5 inline-block w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Complete Payment
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TeamDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-700">Loading dashboard...</div>}>
      <TeamDashboardContent />
    </Suspense>
  );
}
