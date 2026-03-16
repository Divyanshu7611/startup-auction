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

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BattlegroundPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [soldTeamFilter, setSoldTeamFilter] = useState("all");
  const [soldMinPrice, setSoldMinPrice] = useState("");
  const [soldMaxPrice, setSoldMaxPrice] = useState("");
  const [leaderboardMetric, setLeaderboardMetric] = useState("remaining");

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
  const soldStartups = useMemo(
    () => (Array.isArray(data?.soldStartups) ? data.soldStartups : []),
    [data]
  );
  const soldTeamOptions = useMemo(() => {
    const names = new Set();
    soldStartups.forEach((item) => {
      if (item?.owner_team_name) names.add(item.owner_team_name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [soldStartups]);
  const filteredSoldStartups = useMemo(() => {
    const minPrice = Number(soldMinPrice);
    const maxPrice = Number(soldMaxPrice);

    const hasMin = Number.isFinite(minPrice) && soldMinPrice !== "";
    const hasMax = Number.isFinite(maxPrice) && soldMaxPrice !== "";

    return soldStartups
      .filter((item) => {
        if (soldTeamFilter !== "all" && item.owner_team_name !== soldTeamFilter) {
          return false;
        }
        const price = Number(item.final_price || 0);
        if (hasMin && price < minPrice) return false;
        if (hasMax && price > maxPrice) return false;
        return true;
      })
      .sort((a, b) => Number(b.final_price || 0) - Number(a.final_price || 0));
  }, [soldStartups, soldTeamFilter, soldMinPrice, soldMaxPrice]);
  const leaderboard = useMemo(() => {
    const teamMap = new Map();
    teams.forEach((team) => {
      teamMap.set(team.team_id, {
        team_id: team.team_id,
        team_name: team.team_name,
        remaining_amount: Number(team.remaining_amount || 0),
        total_spent: 0,
        startups_won: 0,
      });
    });

    soldStartups.forEach((item) => {
      if (!item?.owner_team_id) return;
      const entry = teamMap.get(item.owner_team_id);
      if (!entry) return;
      entry.total_spent += Number(item.final_price || 0);
      entry.startups_won += 1;
    });

    const rows = Array.from(teamMap.values());
    if (leaderboardMetric === "spent") {
      rows.sort((a, b) => b.total_spent - a.total_spent);
    } else {
      rows.sort((a, b) => b.remaining_amount - a.remaining_amount);
    }
    return rows.slice(0, 5);
  }, [teams, soldStartups, leaderboardMetric]);

  function exportSoldCsv() {
    const rows = filteredSoldStartups.map((item) => ({
      Startup: item.startup_name || "",
      Team: item.owner_team_name || "",
      FinalPrice: Number(item.final_price || 0),
      SoldAt: item.sold_at || "",
    }));

    if (rows.length === 0) return;

    const header = ["Startup", "Team", "FinalPrice", "SoldAt"];
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => {
            const raw = String(row[key] ?? "");
            const escaped = raw.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sold-startups-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

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

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Top Teams
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Leaderboard
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60">
                Updated {formatTime(lastUpdated)}
              </span>
              <select
                value={leaderboardMetric}
                onChange={(event) => setLeaderboardMetric(event.target.value)}
                className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs uppercase tracking-[0.3em] text-white focus:border-cyan-400/60 focus:outline-none"
              >
                <option value="remaining">Highest balance</option>
                <option value="spent">Highest spend</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              No teams available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {leaderboard.map((team, index) => (
                <div
                  key={team.team_id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Rank #{index + 1}
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
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span>Spent: {formatCurrency(team.total_spent)}</span>
                    <span>Wins: {team.startups_won}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Sold Startups
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Which startup sold to which team
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60">
              Updated {formatTime(lastUpdated)}
            </span>
            <button
              type="button"
              onClick={exportSoldCsv}
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              Team Filter
              <select
                value={soldTeamFilter}
                onChange={(event) => setSoldTeamFilter(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm uppercase tracking-wide text-white focus:border-cyan-400/60 focus:outline-none"
              >
                <option value="all">All teams</option>
                {soldTeamOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              Min Price
              <input
                type="number"
                min="0"
                value={soldMinPrice}
                onChange={(event) => setSoldMinPrice(event.target.value)}
                placeholder="0"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              Max Price
              <input
                type="number"
                min="0"
                value={soldMaxPrice}
                onChange={(event) => setSoldMaxPrice(event.target.value)}
                placeholder="No limit"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
              />
            </label>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              Loading sold startups...
            </div>
          ) : soldStartups.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              No startups sold yet.
            </div>
          ) : filteredSoldStartups.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              No sold startups match these filters.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-2 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/60 sm:grid">
                <span>Startup</span>
                <span>Team</span>
                <span>Final Price</span>
                <span>Sold At</span>
              </div>
              <div className="divide-y divide-white/10">
                {filteredSoldStartups.map((item) => (
                  <div
                    key={item.startup_id}
                    className="grid grid-cols-1 gap-2 px-4 py-3 text-sm text-white/80 sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr] sm:gap-2"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 sm:hidden">
                        Startup
                      </p>
                      <p className="font-semibold text-white">{item.startup_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 sm:hidden">
                        Team
                      </p>
                      <p>{item.owner_team_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 sm:hidden">
                        Final Price
                      </p>
                      <p className="text-cyan-200">{formatCurrency(item.final_price || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 sm:hidden">
                        Sold At
                      </p>
                      <p className="text-white/60">{formatDateTime(item.sold_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
