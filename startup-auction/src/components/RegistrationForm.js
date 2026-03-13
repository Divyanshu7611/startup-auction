"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CaptainSection from "./CaptainSection";
import TeamSection from "./TeamSection";
import TeamMembersSection from "./TeamMembersSection";
import "../app/register/register.css";

export default function RegistrationForm({ onBack }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    captain_name: "",
    captain_email: "",
    password: "",
    team_name: "",
    contact_number: "",
    captain_roll_number: "",
    team_members: [], // Start empty - captain alone is valid
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...formData.team_members];
    updated[index][field] = value;

    setFormData({
      ...formData,
      team_members: updated,
    });
  };

  const addMember = () => {
    if (formData.team_members.length < 2) {
      setFormData((prev) => ({
        ...prev,
        team_members: [
          ...prev.team_members,
          { name: "", roll: "", contact: "" },
        ],
      }));
    }
  };

  const removeMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        captain_name: formData.captain_name,
        captain_email: formData.captain_email,
        password: formData.password,
        team_name: formData.team_name,
        contact_number: formData.contact_number,
        captain_roll_number: formData.captain_roll_number,
        team_members: formData.team_members
          .filter((m) => m.name || m.roll || m.contact)
          .map((m) => ({
            name: m.name,
            contact_number: m.contact,
            roll_number: m.roll,
          })),
      };
      const res = await fetch("/api/teams/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      let data = null;
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        const fallback =
          raw?.slice(0, 180) ||
          `Request failed with status ${res.status}`;
        throw new Error(data?.error || fallback || "Registration failed");
      }

      localStorage.setItem("teamId", data.team_id);
      router.push(`/payment?teamId=${data.team_id}`);

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h1>🎯 Bid War Registration</h1>
      <p className="subtitle">Anukriti 2026</p>
      <p className="helper-text" style={{ textAlign: "center", marginTop: 12, marginBottom: 0 }}>
        For queries, contact Event Coordinators: <strong>6378143603</strong> | <strong>9549545450</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <CaptainSection formData={formData} onChange={handleChange} />
        <TeamSection formData={formData} onChange={handleChange} />
        <TeamMembersSection
          members={formData.team_members}
          onMemberChange={handleMemberChange}
          addMember={addMember}
          removeMember={removeMember}
        />

        {error && <p className="limit-text">{error}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Registering..." : "Register Team"}
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
