"use client";

const MAX_MEMBERS = 2;

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

      {members.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7b7f96', fontSize: '14px', margin: '20px 0' }}>
          No team members added. Click "+ Add" to add team members (optional).
        </p>
      )}

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
          
          <button
            type="button"
            onClick={() => removeMember(index)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Remove Member {index + 1}
          </button>
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