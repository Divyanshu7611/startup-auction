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

function getInitials(name) {
  return (name || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "Rs 0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
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
        setError("Missing teamId in URL. Please log in from the home page to open your dashboard.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/teams/getTeamById/${teamId}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view your dashboard.");
            return;
          }
          if (res.status === 403) {
            setError("You don't have access to this team's dashboard. Log in with your own team account.");
            return;
          }
          throw new Error(data?.error || "Failed to load team");
        }
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
      <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <p className="text-center text-sm font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-red-50/40 p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-xl border border-red-200/80 bg-white p-5 shadow-lg shadow-red-500/5 sm:rounded-2xl sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">Unable to load team dashboard</p>
              <p className="mt-1 break-words text-sm text-slate-600">{error}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">Log in with your captain email and password to access your team dashboard.</p>
          <Link href="/" className="mt-5 inline-flex min-h-[44px] items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:mt-6">← Back to home / Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 px-3 py-4 sm:p-4 md:p-6 lg:p-8">
      <div className={`mx-auto w-full min-w-0 max-w-5xl transition-all duration-300 ${paymentPending ? "blur-sm pointer-events-none select-none scale-[0.98]" : ""}`}>
        {/* Top bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <Link href="/" className="min-h-[44px] min-w-[44px] flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors -ml-1">← Home</Link>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Startup Auction</span>
        </div>

        {/* Header card */}
        <header className="mb-6 overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 sm:mb-8 sm:rounded-2xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Team Dashboard</p>
                <h1 className="mt-2 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">{team.team_name}</h1>
                <p className="mt-2 truncate text-sm text-slate-500 sm:overflow-visible sm:whitespace-normal">Team ID: <span className="font-mono text-slate-700">{teamId}</span></p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                  team.payment_status
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60"
                }`}
              >
                {team.payment_status ? (
                  <><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</>
                ) : (
                  <><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Pending</>
                )}
              </span>
            </div>
          </div>
        </header>

        <section className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 transition-shadow hover:shadow-xl sm:rounded-2xl sm:p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Wallet Credits</h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 sm:text-4xl">
              {formatCurrency(team.wallet)}
            </p>
            <p className="mt-2 text-sm text-slate-500">Available credits in your team wallet.</p>
          </div>

          {/* Captain card */}
          <div className="min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 transition-shadow hover:shadow-xl sm:rounded-2xl sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              Captain Details
            </h2>
            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              {[
                { label: "Name", value: team.captain_name },
                { label: "Email", value: team.captain_email },
                { label: "Contact", value: team.contact_number },
                { label: "Roll Number", value: team.captain_roll_number || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
                  <span className="min-w-0 break-words text-sm font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team members card */}
          <div className="min-w-0 rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 transition-shadow hover:shadow-xl sm:rounded-2xl sm:p-6">
            <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </span>
              Team Members
              {members.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{members.length}</span>
              )}
            </h2>
            {members.length > 0 ? (
              <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                {members.map((member, index) => {
                  const name = getMemberName(member);
                  const meta = getMemberMeta(member);
                  return (
                    <li
                      key={`${name}-${index}`}
                      className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50 sm:gap-4 sm:rounded-xl sm:px-4 sm:py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 text-xs sm:h-10 sm:w-10 sm:text-sm">
                        {getInitials(name)}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate font-medium text-slate-800 sm:break-words sm:whitespace-normal">{name}</p>
                        {meta ? <p className="mt-0.5 truncate text-xs text-slate-500 sm:break-all sm:whitespace-normal">{meta}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center sm:mt-5 sm:rounded-xl sm:py-8">
                <p className="text-sm text-slate-500">No team members added yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {paymentPending ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm safe-area-inset">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto overflow-x-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200/80 sm:rounded-2xl">
            <div className="h-1 shrink-0 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-5 text-center sm:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mb-4 sm:h-14 sm:w-14">
                <svg className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Payment Required</h3>
              <p className="mt-2 text-sm text-slate-600">
                Complete payment to unlock full access to your team dashboard.
              </p>
              <Link
                href={teamId ? `/payment?teamId=${teamId}` : "/payment"}
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-700 hover:to-violet-700 sm:mt-6"
              >
                Complete Payment
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TeamDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 sm:p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <TeamDashboardContent />
    </Suspense>
  );
}
