export default function TeamSection({ formData, onChange }) {
  return (
    <div className="section">
      <h2>Team Details</h2>

      <input
        type="text"
        placeholder="Team Name"
        value={formData.team_name}
        onChange={(e) => onChange("team_name", e.target.value)}
        required
      />
    </div>
  );
}