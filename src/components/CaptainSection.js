"use client";

import { useState } from "react";

export default function CaptainSection({ formData, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="section">
      <h2>Captain Details</h2>

      <input
        type="text"
        placeholder="Captain Name"
        value={formData.captain_name}
        onChange={(e) => onChange("captain_name", e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Captain Roll Number"
        value={formData.captain_roll_number}
        onChange={(e) => onChange("captain_roll_number", e.target.value)}
        required
      />

      <input
        type="tel"
        placeholder="Contact Number"
        value={formData.contact_number}
        onChange={(e) => onChange("contact_number", e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Captain Email"
        value={formData.captain_email}
        onChange={(e) => onChange("captain_email", e.target.value)}
        required
      />

      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          required
        />
        <span
          className="eye-icon"
          onClick={() => setShowPassword(!showPassword)}
        >
          👁
        </span>
      </div>
    </div>
  );
}