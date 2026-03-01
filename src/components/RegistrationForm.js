"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CaptainSection from "./CaptainSection";
import TeamSection from "./TeamSection";
import TeamMembersSection from "./TeamMembersSection";
import "../app/register/register.css";

export default function RegistrationForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    captain_name: "",
    captain_email: "",
    password: "",
    team_name: "",
    contact_number: "",
    captain_roll_number: "",
    team_members: [{ name: "", roll: "", contact: "" }],
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
    if (formData.team_members.length < 3) {
      setFormData((prev) => ({
        ...prev,
        team_members: [
          ...prev.team_members,
          { name: "", roll: "", contact: "" },
        ],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teams/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("teamId", data.team_id);
      router.push("/payment");

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
     <h1>🚀 Startup Auction Registration <span class="highlight">Training and Placement Cell</span></h1>
      <form onSubmit={handleSubmit}>
        <CaptainSection formData={formData} onChange={handleChange} />
        <TeamSection formData={formData} onChange={handleChange} />
        <TeamMembersSection
          members={formData.team_members}
          onMemberChange={handleMemberChange}
          addMember={addMember}
        />

        {error && <p className="limit-text">{error}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Registering..." : "Register Team"}
        </button>
      </form>
    </div>
  );
}