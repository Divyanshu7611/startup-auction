"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../../register/register.css";
import "./dashboard.css";

function normalizeMembers(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getMemberName(member) {
  if (typeof member === "string") return member;
  if (member && typeof member === "object") {
    return member.name || member.member_name || "Unnamed member";
  }
  return "Unnamed member";
}

function getMemberMeta(member) {
  if (!member || typeof member !== "object") return "";
  const parts = [];
  if (member.roll_number) parts.push(`Roll: ${member.roll_number}`);
  if (member.contact_number) parts.push(`Contact: ${member.contact_number}`);
  return parts.join(" | ");
}

function toEditableMembers(members) {
  return (members || []).map((member) => ({
    name: typeof member?.name === "string" ? member.name : "",
    roll_number: typeof member?.roll_number === "string" ? member.roll_number : "",
    contact_number:
      typeof member?.contact_number === "string" ? member.contact_number : "",
  }));
}

function TeamDashboardContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const viewer = searchParams.get("viewer");
  const memberIndexParam = searchParams.get("memberIndex");
  const memberIndex = Number.isInteger(Number(memberIndexParam)) ? Number(memberIndexParam) : 0;
  const isMemberView = viewer === "member";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    captain_name: "",
    contact_number: "",
    captain_roll_number: "",
    team_members: [],
  });

  useEffect(() => {
    async function loadTeam() {
      if (!teamId) {
        setError("Missing teamId in URL. Open /team/dashboard?teamId=YOUR_ID");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/teams/getTeamById/${teamId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load team");
        setTeam(data);

        if (!isMemberView && typeof window !== "undefined") {
          const local = localStorage.getItem("teamDetails");
          if (local) {
            try {
              const localTeam = JSON.parse(local);
              const sameTeam = String(localTeam?.team_id) === String(data?.team_id);
              const sameCaptain = localTeam?.captain_email === data?.captain_email;
              setCanManage(Boolean(sameTeam && sameCaptain));
            } catch {
              setCanManage(false);
            }
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamId, isMemberView]);

  useEffect(() => {
    if (!team) return;
    setForm({
      captain_name: team.captain_name || "",
      contact_number: team.contact_number || "",
      captain_roll_number: team.captain_roll_number || "",
      team_members: toEditableMembers(normalizeMembers(team.team_members)),
    });
  }, [team]);

  const members = useMemo(() => normalizeMembers(team?.team_members), [team]);
  const visibleMember = isMemberView ? members[memberIndex] : null;
  const paymentPending = team && !team.payment_status;
  const dashboardBaseUrl =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/team/dashboard?teamId=${teamId}`
      : `/team/dashboard?teamId=${teamId}`;

  const handleMemberFieldChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.team_members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, team_members: updated };
    });
  };

  const addMember = () => {
    setForm((prev) => {
      if (prev.team_members.length >= 3) return prev;
      return {
        ...prev,
        team_members: [...prev.team_members, { name: "", roll_number: "", contact_number: "" }],
      };
    });
  };

  const handleSave = async () => {
    if (!teamId || !team) return;

    try {
      setSaving(true);
      setSaveMessage("");

      const res = await fetch(`/api/teams/update/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captain_email: team.captain_email,
          captain_name: form.captain_name,
          contact_number: form.contact_number,
          captain_roll_number: form.captain_roll_number,
          team_members: form.team_members,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update team details");

      setTeam(data);
      setEditing(false);
      setSaveMessage("Team details updated successfully.");
    } catch (err) {
      setSaveMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-screen">
        <div className="form-container dashboard-state-card">
          <p className="subtitle dashboard-center-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-screen">
        <div className="form-container dashboard-state-card">
          <p className="limit-text">Unable to load team dashboard</p>
          <p className="helper-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      <div className={`form-container dashboard-shell ${paymentPending ? "dashboard-shell--blocked" : ""}`}>
        <header className="section dashboard-header">
          <p className="dashboard-eyebrow">Team Dashboard</p>
          <h1>{team.team_name}</h1>
          <p className="helper-text dashboard-helper">
            View mode:{" "}
            <span className="dashboard-strong">{isMemberView ? "Member (read only)" : "Captain"}</span>
          </p>
          <p className="helper-text dashboard-helper">
            Payment status:{" "}
            <span className={`dashboard-strong ${team.payment_status ? "dashboard-ok" : "dashboard-warn"}`}>
              {team.payment_status ? "Completed" : "Pending"}
            </span>
          </p>
        </header>

        {isMemberView ? (
          <section className="dashboard-grid">
            <div className="section dashboard-card">
              <h2>Your Information</h2>
              {visibleMember ? (
                <div className="dashboard-stack">
                  <p><span className="dashboard-strong">Name:</span> {getMemberName(visibleMember)}</p>
                  <p><span className="dashboard-strong">Roll Number:</span> {visibleMember.roll_number || "N/A"}</p>
                  <p><span className="dashboard-strong">Contact:</span> {visibleMember.contact_number || "N/A"}</p>
                </div>
              ) : (
                <p className="limit-text">Invalid member link. Ask captain for the correct link.</p>
              )}
            </div>

            <div className="section dashboard-card">
              <h2>Captain Contact</h2>
              <div className="dashboard-stack">
                <p><span className="dashboard-strong">Name:</span> {team.captain_name}</p>
                <p><span className="dashboard-strong">Email:</span> {team.captain_email}</p>
                <p><span className="dashboard-strong">Contact:</span> {team.contact_number}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="dashboard-grid">
            <div className="section dashboard-card">
              <div className="member-header">
                <h2>Captain Details</h2>
                {canManage ? (
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setEditing((prev) => !prev)}
                  >
                    {editing ? "Cancel" : "Edit"}
                  </button>
                ) : null}
              </div>

              {editing && canManage ? (
                <div className="dashboard-stack">
                  <input
                    value={form.captain_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, captain_name: e.target.value }))}
                    placeholder="Captain name"
                  />
                  <input
                    value={form.contact_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, contact_number: e.target.value }))}
                    placeholder="Captain contact number"
                  />
                  <input
                    value={form.captain_roll_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, captain_roll_number: e.target.value }))}
                    placeholder="Captain roll number"
                  />
                </div>
              ) : (
                <div className="dashboard-stack">
                  <p><span className="dashboard-strong">Name:</span> {team.captain_name}</p>
                  <p><span className="dashboard-strong">Email:</span> {team.captain_email}</p>
                  <p><span className="dashboard-strong">Contact:</span> {team.contact_number}</p>
                  <p><span className="dashboard-strong">Roll Number:</span> {team.captain_roll_number || "N/A"}</p>
                </div>
              )}

              {!canManage ? (
                <p className="helper-text">
                  Captain edit mode is available only after captain login on this device.
                </p>
              ) : null}
            </div>

            <div className="section dashboard-card">
              <h2>Team Members</h2>
              {editing && canManage ? (
                <div className="dashboard-stack">
                  {form.team_members.map((member, index) => (
                    <div key={`member-edit-${index}`} className="member-card">
                      <p className="helper-text">Member {index + 1}</p>
                      <div className="dashboard-stack">
                        <input
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) => handleMemberFieldChange(index, "name", e.target.value)}
                        />
                        <input
                          placeholder="Roll number"
                          value={member.roll_number}
                          onChange={(e) => handleMemberFieldChange(index, "roll_number", e.target.value)}
                        />
                        <input
                          placeholder="Contact number"
                          value={member.contact_number}
                          onChange={(e) => handleMemberFieldChange(index, "contact_number", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addMember}
                    disabled={form.team_members.length >= 3}
                    className="add-btn"
                  >
                    Add Member
                  </button>
                </div>
              ) : members.length > 0 ? (
                <ul className="dashboard-list">
                  {members.map((member, index) => (
                    <li key={`${getMemberName(member)}-${index}`} className="member-card">
                      <p className="dashboard-strong">{getMemberName(member)}</p>
                      {getMemberMeta(member) ? <p className="helper-text">{getMemberMeta(member)}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="helper-text">No team members added yet.</p>
              )}
            </div>
          </section>
        )}

        {!isMemberView ? (
          <section className="section dashboard-card">
            <h2>Member View Links</h2>
            <p className="helper-text">
              Share these links with team members. They can only view their own details.
            </p>
            <div className="dashboard-stack">
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div key={`member-link-${index}`} className="member-card">
                    <p className="dashboard-strong">{getMemberName(member)}</p>
                    <p className="helper-text dashboard-break">
                      {`${dashboardBaseUrl}&viewer=member&memberIndex=${index}`}
                    </p>
                  </div>
                ))
              ) : (
                <p className="helper-text">No members available yet.</p>
              )}
            </div>

            {editing && canManage ? (
              <div className="dashboard-actions">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="submit-btn"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saveMessage ? (
                  <p className={saveMessage.includes("successfully") ? "success-text" : "limit-text"}>{saveMessage}</p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {paymentPending ? (
        <div className="dashboard-overlay">
          <div className="form-container dashboard-modal">
            <h2>Payment Required</h2>
            <p className="helper-text">
              {isMemberView
                ? "Team payment is pending. Ask captain to complete payment."
                : "Your payment is pending. Complete payment to fully access your team dashboard."}
            </p>
            {!isMemberView ? (
              <Link
                href={teamId ? `/payment?teamId=${teamId}` : "/payment"}
                className="submit-btn dashboard-link-btn"
              >
                Complete Payment
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TeamDashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard-screen"><div className="form-container dashboard-state-card"><p className="subtitle dashboard-center-text">Loading dashboard...</p></div></div>}>
      <TeamDashboardContent />
    </Suspense>
  );
}
