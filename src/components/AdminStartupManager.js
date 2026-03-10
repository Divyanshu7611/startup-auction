"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
  name: "",
  sector: "",
  revenue: "",
  growth_rate: "",
  risk_level: "Medium",
  base_price: "",
  current_price: "",
};

export default function AdminStartupManager() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadStartups() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/startups", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load startups");
      }

      setStartups(Array.isArray(data?.startups) ? data.startups : []);
    } catch (err) {
      setError(err.message || "Failed to load startups");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStartups();
  }, []);

  const startupCount = useMemo(() => startups.length, [startups]);

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to add startup");
      }

      setForm(DEFAULT_FORM);
      setSuccess("Startup added successfully.");
      setStartups((prev) => [data.startup, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to add startup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add Startup</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Stored: {startupCount}
          </span>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-700">
            Name
            <input
              type="text"
              value={form.name}
              onChange={onChange("name")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          <label className="block text-sm text-slate-700">
            Sector
            <input
              type="text"
              value={form.sector}
              onChange={onChange("sector")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          <label className="block text-sm text-slate-700">
            Revenue
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.revenue}
              onChange={onChange("revenue")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          <label className="block text-sm text-slate-700">
            Growth Rate
            <input
              type="number"
              step="0.01"
              value={form.growth_rate}
              onChange={onChange("growth_rate")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          <label className="block text-sm text-slate-700">
            Risk Level
            <select
              value={form.risk_level}
              onChange={onChange("risk_level")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label className="block text-sm text-slate-700">
            Base Price
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.base_price}
              onChange={onChange("base_price")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          <label className="block text-sm text-slate-700 sm:col-span-2">
            Current Price
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.current_price}
              onChange={onChange("current_price")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              required
            />
          </label>

          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="sm:col-span-2 text-sm text-emerald-700">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Adding startup..." : "Add Startup"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Startups</h3>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading startups...</p>
        ) : startups.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No startups added yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Sector</th>
                  <th className="px-2 py-2">Revenue</th>
                  <th className="px-2 py-2">Growth</th>
                  <th className="px-2 py-2">Risk</th>
                  <th className="px-2 py-2">Base</th>
                  <th className="px-2 py-2">Current</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((startup) => (
                  <tr key={String(startup.startup_id)} className="border-b border-slate-100 text-slate-700">
                    <td className="px-2 py-2">{startup.name}</td>
                    <td className="px-2 py-2">{startup.sector}</td>
                    <td className="px-2 py-2">{startup.revenue}</td>
                    <td className="px-2 py-2">{startup.growth_rate}</td>
                    <td className="px-2 py-2">{startup.risk_level}</td>
                    <td className="px-2 py-2">{startup.base_price}</td>
                    <td className="px-2 py-2">{startup.current_price}</td>
                    <td className="px-2 py-2">{startup.status}</td>
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
