"use client";

const MAX_MEMBERS = 2; // Max 2 additional members (+ 1 captain = 3 total)

export default function TeamMembersSection({
  members = [],
  onMemberChange,
  addMember,
  removeMember,
}) {
  const isMaxReached = members.length >= MAX_MEMBERS;

  return (
    <div className="section">
      <div className="member-header">
        <h2>Team Members (Optional)</h2>
        <button
          type="button"
          className="add-btn"
          onClick={addMember}
          disabled={isMaxReached}
        >
          + Add Member
        </button>
      </div>

      <p className="helper-text" style={{ marginTop: 0, marginBottom: 16 }}>
        Captain can register alone, or add up to 2 team members (max 3 total).
      </p>

      {members.length === 0 && (
        <p style={{ color: "#7b7f96", fontSize: 14, fontStyle: "italic" }}>
          No additional members added. Click "+ Add Member" to add teammates.
        </p>
      )}

      {members.map((member, index) => (
        <div key={index} className="member-card" data-index={index + 1}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3d52" }}>Member {index + 1}</span>
            {removeMember && (
              <button
                type="button"
                onClick={() => removeMember(index)}
                style={{
                  background: "rgba(192, 57, 43, 0.1)",
                  color: "#c0392b",
                  border: "1px solid rgba(192, 57, 43, 0.2)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Member Name"
            value={member.name}
            onChange={(e) =>
              onMemberChange(index, "name", e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Roll Number"
            value={member.roll}
            onChange={(e) =>
              onMemberChange(index, "roll", e.target.value)
            }
            required
          />

          <input
            type="tel"
            placeholder="Contact Number"
            value={member.contact}
            onChange={(e) =>
              onMemberChange(index, "contact", e.target.value)
            }
            required
          />
        </div>
      ))}

      {isMaxReached && (
        <p className="limit-text">
          Maximum 2 team members allowed (plus captain = 3 total).
        </p>
      )}
    </div>
  );
}