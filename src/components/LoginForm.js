"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ onBack }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teams/loginTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captain_email: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.teamDetails) {
        localStorage.setItem("teamDetails", JSON.stringify(data.teamDetails));
      }
      router.push("/payment");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h1>Login to your team</h1>
      <p className="subtitle">Use your captain email and password</p>

      <form onSubmit={handleSubmit}>
        <div className="section">
          <input
            type="email"
            placeholder="Captain Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setShowPassword((p) => !p)}
              aria-label="Toggle password visibility"
            >
              👁
            </span>
          </div>
        </div>

        {error && <p className="limit-text">{error}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {onBack && (
          <button
            type="button"
            className="submit-btn violet"
            style={{ marginTop: 12 }}
            onClick={onBack}
            disabled={loading}
          >
            Back
          </button>
        )}
      </form>
    </div>
  );
}
