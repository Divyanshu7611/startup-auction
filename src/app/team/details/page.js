"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function formatCrore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "Rs 0 Cr";
  const formatted = Number.isInteger(num)
    ? num.toString()
    : num.toFixed(2).replace(/\.?0+$/, "");
  return `Rs ${formatted} Cr`;
}

function TeamDetailsContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(null);
  const [soldStartups, setSoldStartups] = useState([]);

  useEffect(() => {
    async function loadDetails() {
      if (!teamId) {
        setError("Missing teamId in URL. Please log in from the home page.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/teams/details/${teamId}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view your team details.");
            return;
          }
          if (res.status === 403) {
            setError("You don't have access to this team's details.");
            return;
          }
          throw new Error(data?.error || "Failed to load team details");
        }

        setTeam(data?.team || null);
        setSoldStartups(Array.isArray(data?.sold_startups) ? data.sold_startups : []);
      } catch (err) {
        setError(err.message || "Failed to load team details");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [teamId]);

  const totalSoldValue = useMemo(
    () => soldStartups.reduce((sum, startup) => sum + Number(startup?.current_price || 0), 0),
    [soldStartups]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <p className="text-center text-sm font-medium text-slate-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-red-50/40 p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-xl border border-red-200/80 bg-white p-5 shadow-lg shadow-red-500/5 sm:rounded-2xl sm:p-8">
          <p className="font-semibold text-slate-900">Unable to load team details</p>
          <p className="mt-1 text-sm text-slate-600">{error}</p>
          <Link
            href={teamId ? `/team/dashboard?teamId=${teamId}` : "/"}
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-slate-100 to-indigo-50/30 px-3 py-4 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <Link
            href={teamId ? `/team/dashboard?teamId=${teamId}` : "/team/dashboard"}
            className="min-h-11 min-w-11 flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors -ml-1"
          >
            ← Dashboard
          </Link>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Startup Auction</span>
        </div>

        <header className="mb-6 overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 sm:mb-8 sm:rounded-2xl">
          <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Team Details</p>
            <h1 className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              {team?.team_name || "Team"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Team ID: <span className="font-mono text-slate-700">{teamId}</span>
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 sm:rounded-2xl sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Wallet Balance</p>
            <p className="mt-3 text-2xl font-bold text-emerald-700 sm:text-3xl">{formatCrore(team?.wallet)}</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 sm:mt-8 sm:rounded-2xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Startups Sold To Your Team</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {soldStartups.length} startup{soldStartups.length === 1 ? "" : "s"}
            </span>
          </div>

          {soldStartups.length > 0 ? (
            <>
              <p className="mt-2 text-sm text-slate-500">Total sold value: {formatCrore(totalSoldValue)}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Sector</th>
                      <th className="px-3 py-2 font-medium">Risk</th>
                      <th className="px-3 py-2 font-medium">Growth</th>
                      <th className="px-3 py-2 font-medium">Sold Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldStartups.map((startup) => (
                      <tr key={startup.startup_id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-3 font-medium text-slate-800">{startup.name}</td>
                        <td className="px-3 py-3 text-slate-700">{startup.sector}</td>
                        <td className="px-3 py-3 text-slate-700">{startup.risk_level}</td>
                        <td className="px-3 py-3 text-slate-700">{startup.growth_rate}</td>
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          {formatCrore(startup.current_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
              <p className="text-sm text-slate-500">No sold startups are assigned to this team yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function TeamDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 sm:p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <TeamDetailsContent />
    </Suspense>
  );
}
