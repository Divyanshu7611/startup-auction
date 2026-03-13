"use client";

const MAX_MEMBERS = 2;

export default function TeamMembersSection({
  members = [],
  onMemberChange,
  addMember,
}) {
  const isMaxReached = members.length >= MAX_MEMBERS;

  return (
    <div className="section">
      <div className="member-header">
        <h2>Team Members (Max 2, Optional)</h2>
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
            placeholder={`Member ${index + 1} Name (Optional)`}
            value={member.name}
            onChange={(e) =>
              onMemberChange(index, "name", e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Roll Number (Optional)"
            value={member.roll}
            onChange={(e) =>
              onMemberChange(index, "roll", e.target.value)
            }
          />

          <input
            type="tel"
            placeholder="Contact Number (Optional)"
            value={member.contact}
            onChange={(e) =>
              onMemberChange(index, "contact", e.target.value)
            }
          />
        </div>
      ))}

      {isMaxReached && (
        <p className="limit-text">
          Maximum 2 team members allowed (excluding captain).
        </p>
      )}
    </div>
  );
}