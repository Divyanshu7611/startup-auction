"use client";

const MAX_MEMBERS = 3;

export default function TeamMembersSection({
  members = [],
  onMemberChange,
  addMember,
}) {
  const isMaxReached = members.length >= MAX_MEMBERS;

  return (
    <div className="section">
      <div className="member-header">
        <h2>Team Members (Max 3)</h2>
        <button
          type="button"
          className="add-btn"
          onClick={addMember}
          disabled={isMaxReached}
        >
          + Add
        </button>
      </div>

      {members.map((member, index) => (
        <div key={index} className="member-card">
          <input
            type="text"
            placeholder={`Member ${index + 1} Name`}
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
          Maximum 3 team members allowed.
        </p>
      )}
    </div>
  );
}