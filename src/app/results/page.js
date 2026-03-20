"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatCrore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "Rs 0 Cr";
  const formatted = Number.isInteger(num)
    ? num.toString()
    : num.toFixed(2).replace(/\.?0+$/, "");
  return `Rs ${formatted} Cr`;
}

function getRankBadgeColor(rank) {
  if (rank === 1) return "from-yellow-400 to-amber-500";
  if (rank === 2) return "from-slate-300 to-slate-400";
  if (rank === 3) return "from-orange-400 to-amber-600";
  return "from-indigo-400 to-violet-500";
}

function getRankIcon(rank) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  // if (rank === 3) return "🥉";
  return "🎯";
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch("/api/results", {
          cache: "no-store",
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch results");
        }
        
        setResults(data.results || []);
      } catch (err) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-center text-sm font-medium text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-red-50/40 p-4">
        <div className="w-full max-w-xl rounded-xl border border-red-200/80 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Unable to load results</p>
              <p className="mt-1 text-sm text-slate-600">{error}</p>
            </div>
          </div>
          <Link href="/" className="mt-5 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 px-3 py-6 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to Home
          </Link>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Final Results</span>
        </div>

        {/* Title Card */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/60">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              🏆 Final Results & Winners
            </h1>
            <p className="mt-2 text-slate-600">
              Final valuations of all teams - Winners: Top 2 Teams
            </p>
            <div className="mt-4 rounded-lg bg-indigo-50 p-4 border border-indigo-100">
              <p className="text-sm font-medium text-indigo-900">
                <span className="font-semibold">Formula:</span> Final Valuation = Total Profit (only if Base Price × Multiplier &gt; Purchase Price) + 25% of Remaining Wallet
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium text-slate-900">No results available yet</p>
            <p className="mt-2 text-sm text-slate-600">Teams with completed payments will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((team) => {
              const isWinner = team.rank <= 2;
              return (
              <div
                key={team.team_id}
                className={`overflow-hidden rounded-xl bg-white shadow-lg ring-1 transition-all ${
                  isWinner
                    ? "ring-2 ring-indigo-300 shadow-indigo-100"
                    : "ring-slate-200/60 hover:shadow-xl"
                }`}
              >
                {/* Winner Badge */}
                {isWinner && (
                  <div className={`h-1 w-full ${team.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} />
                )}
                {/* Team Header */}
                <div
                  className="cursor-pointer p-5 sm:p-6"
                  onClick={() => setExpandedTeam(expandedTeam === team.team_id ? null : team.team_id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Rank Badge */}
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getRankBadgeColor(team.rank)} shadow-lg`}>
                        <span className="text-2xl">{getRankIcon(team.rank)}</span>
                      </div>

                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-slate-900 break-words">
                            {team.team_name}
                          </h2>
                          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                            Rank #{team.rank}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Captain: <span className="font-medium text-slate-800">{team.captain_name}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Total Profit:</span>
                            <span className="ml-2 font-semibold text-emerald-600">
                              {formatCrore(team.total_profit)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Wallet Bonus:</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {formatCrore(team.wallet_bonus)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Valuation */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Final Valuation
                      </p>
                      <p className="mt-1 text-2xl font-bold text-indigo-600">
                        {formatCrore(team.final_valuation)}
                      </p>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div className="mt-4 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700">
                      {expandedTeam === team.team_id ? "Hide Details" : "Show Details"}
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          expandedTeam === team.team_id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTeam === team.team_id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Wallet Details */}
                      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
                        <h3 className="text-sm font-semibold text-slate-900">Wallet Breakdown</h3>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Remaining Wallet:</span>
                            <span className="font-semibold text-slate-900">{formatCrore(team.wallet)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Bonus (25%):</span>
                            <span className="font-semibold text-blue-600">{formatCrore(team.wallet_bonus)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Startups Owned */}
                      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
                        <h3 className="text-sm font-semibold text-slate-900">
                          Startups Owned ({team.startups.length})
                        </h3>
                        {team.startups.length > 0 ? (
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                            {team.startups.map((startup, idx) => (
                              <div
                                key={idx}
                                className={`rounded border p-2 text-xs ${
                                  startup.is_profitable 
                                    ? 'border-emerald-200 bg-emerald-50' 
                                    : 'border-red-200 bg-red-50'
                                }`}
                              >
                                <p className="font-semibold text-slate-900">{startup.name}</p>
                                <div className="mt-1 space-y-0.5 text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Base Price:</span>
                                    <span>{formatCrore(startup.base_price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Purchase Price:</span>
                                    <span>{formatCrore(startup.purchase_price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Multiplier:</span>
                                    <span>×{startup.multiplier}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Final Value:</span>
                                    <span>{formatCrore(startup.final_value)}</span>
                                  </div>
                                </div>
                                <p className={`mt-1 text-right font-semibold ${
                                  startup.is_profitable ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  Profit: {formatCrore(startup.profit)}
                                  {!startup.is_profitable && ' (No profit)'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">No startups owned</p>
                        )}
                      </div>
                    </div>

                    {/* Total Calculation */}
                    <div className="mt-4 rounded-lg bg-indigo-50 p-4 border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium text-indigo-900">
                            {formatCrore(team.total_profit)} + {formatCrore(team.wallet_bonus)}
                          </p>
                          <p className="text-xs text-indigo-700 mt-0.5">
                            (Total Profit + Wallet Bonus)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-indigo-700">Final Valuation</p>
                          <p className="text-xl font-bold text-indigo-600">
                            {formatCrore(team.final_valuation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
