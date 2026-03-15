"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const POLL_INTERVAL_MS = 5000;

function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "Rs 0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function BattlegroundPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/battleground", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load battleground data");
        }
        if (!active) return;
        setData(payload);
        setLastUpdated(payload?.updatedAt || new Date().toISOString());
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load battleground data");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const liveAuction = data?.liveAuction || null;
  const teams = useMemo(() => (Array.isArray(data?.teams) ? data.teams : []), [data]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),radial-gradient(circle_at_20%_80%,_rgba(244,114,182,0.2),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 font-sans sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
              Startup Auction
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Battleground
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-100/70">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live feed
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1.5">
              Polling every {POLL_INTERVAL_MS / 1000}s
            </span>
            <Link
              href="/"
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Home
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_60px_-40px_rgba(56,189,248,0.7)] backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/60">
                  Startup Live
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {liveAuction?.startup_name || "No startup live right now"}
                </h2>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                {liveAuction ? "Live" : "Waiting"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Current Bid Amount
                </p>
                <p className="mt-3 text-3xl font-semibold text-cyan-200">
                  {formatCurrency(liveAuction?.bid_amount || 0)}
                </p>
                <p className="mt-1 text-xs text-white/50">Live bid meter</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Current Highest Bidder
                </p>
                <p className="mt-3 text-2xl font-semibold text-fuchsia-200 sm:text-3xl">
                  {liveAuction?.highest_bidder_name || "Awaiting first bid"}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {liveAuction?.highest_bidder ? `Team #${liveAuction.highest_bidder}` : "No team yet"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
              <span>
                Web polling active. Last sync:{" "}
                <span className="font-semibold text-white/80">
                  {formatTime(lastUpdated)}
                </span>
              </span>
              {loading ? (
                <span className="inline-flex items-center gap-2 text-cyan-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
                  Syncing...
                </span>
              ) : error ? (
                <span className="text-rose-200">Sync failed</span>
              ) : (
                <span className="text-emerald-200">Live</span>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              Battleground Status
            </h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Current Highest Bid
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200">
                  {formatCurrency(liveAuction?.highest_bid || liveAuction?.bid_amount || 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Teams Online
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {teams.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  System Status
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {error ? "Data fetch error" : "All systems active"}
                </p>
                {error ? (
                  <p className="mt-2 text-xs text-rose-200">{error}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Team Balances
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Team Name / Remaining Balance
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60">
              Updated {formatTime(lastUpdated)}
            </span>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              Loading battleground data...
            </div>
          ) : teams.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              No teams available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div
                  key={team.team_id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Team
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {team.team_name}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
                    Remaining Balance
                  </p>
                  <p className="mt-1 text-xl font-semibold text-cyan-200">
                    {formatCurrency(team.remaining_amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
