"use client";

import { useEffect, useMemo, useState } from "react";

function formatAmount(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export default function AdminAuctionManager() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [state, setState] = useState({
    liveAuction: null,
    startups: [],
    teams: [],
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadState() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/manage-auction", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load auction state");
      }

      setState(data);
    } catch (err) {
      setError(err.message || "Failed to load auction state");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  function applyServerState(nextState) {
    setState((prev) => ({
      liveAuction:
        Object.prototype.hasOwnProperty.call(nextState, "liveAuction")
          ? nextState.liveAuction
          : prev.liveAuction,
      startups:
        Object.prototype.hasOwnProperty.call(nextState, "startups")
          ? nextState.startups
          : prev.startups,
      teams:
        Object.prototype.hasOwnProperty.call(nextState, "teams")
          ? nextState.teams
          : prev.teams,
    }));
  }

  const highestBidderId = state.liveAuction?.highest_bidder || null;

  const teamCount = useMemo(() => state.teams.length, [state.teams]);

  async function startAuction(startupId) {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/manage-auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to start auction");
      }

      applyServerState(data);
      setMessage("Startup is now live.");
    } catch (err) {
      setError(err.message || "Failed to start auction");
    } finally {
      setActionLoading(false);
    }
  }

  async function stopAuction() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/manage-auction", {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to stop auction");
      }

      applyServerState(data);
      setMessage("Auction stopped and startup moved back to available.");
    } catch (err) {
      setError(err.message || "Failed to stop auction");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateBid(teamId, direction) {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/manage-auction", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bid",
          teamId,
          direction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update bid");
      }

      applyServerState(data);
      setMessage("Bid updated.");
    } catch (err) {
      setError(err.message || "Failed to update bid");
    } finally {
      setActionLoading(false);
    }
  }

  async function sellCurrentStartup() {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/manage-auction", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sell" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to sell startup");
      }

      applyServerState(data);
      setMessage("Startup sold to the highest bidder.");
    } catch (err) {
      setError(err.message || "Failed to sell startup");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Auction</h2>
            <p className="text-sm text-slate-600">One startup can be live at a time</p>
          </div>

          <button
            type="button"
            onClick={loadState}
            disabled={loading || actionLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Current Live Startup</h3>
          {state.liveAuction ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">LIVE</span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              No Live Startup
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : !state.liveAuction ? (
          <p className="text-sm text-slate-600">Select an available startup and click Go Live.</p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Startup</p>
                <p className="text-lg font-semibold text-slate-900">{state.liveAuction.startup_name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Current Auction Amount</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatAmount(state.liveAuction.bid_amount)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Highest Bidder</p>
                <p className="text-base font-medium text-slate-900">
                  {state.liveAuction.highest_bidder_name || "No bids yet"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 self-end sm:justify-end">
                <button
                  type="button"
                  onClick={sellCurrentStartup}
                  disabled={actionLoading || !state.liveAuction.highest_bidder}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sell
                </button>

                <button
                  type="button"
                  onClick={stopAuction}
                  disabled={actionLoading}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Teams ({teamCount})</h3>
          <span className="text-xs text-slate-500">+ / - changes live bid by 50,000</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading teams...</p>
        ) : state.teams.length === 0 ? (
          <p className="text-sm text-slate-600">No teams registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {state.teams.map((team) => {
              const isHighestBidder = highestBidderId === team.team_id;
              return (
                <div
                  key={team.team_id}
                  className={`rounded-xl border p-4 ${
                    isHighestBidder ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{team.team_name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Remaining: <span className="font-semibold">{formatAmount(team.remaining_amount)}</span>
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateBid(team.team_id, "plus")}
                      disabled={actionLoading || !state.liveAuction}
                      className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => updateBid(team.team_id, "minus")}
                      disabled={actionLoading || !state.liveAuction || !isHighestBidder}
                      className="w-full rounded-md bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Available Startups</h3>

        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading startups...</p>
        ) : state.startups.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No available startups left.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-2 py-2">Startup</th>
                  <th className="px-2 py-2">Sector</th>
                  <th className="px-2 py-2">Base Price</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {state.startups.map((startup) => (
                  <tr key={startup.startup_id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-2 py-2 font-medium">{startup.name}</td>
                    <td className="px-2 py-2">{startup.sector}</td>
                    <td className="px-2 py-2">{formatAmount(startup.base_price)}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => startAuction(startup.startup_id)}
                        disabled={actionLoading || Boolean(state.liveAuction)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Go Live
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
