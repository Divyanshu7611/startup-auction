export default function PaymentSection({ paymentStatus, onChange }) {
  return (
    <div className="section">
      <h2>Payment</h2>

      <p>Entry Fee: ₹60</p>

      <select
        value={paymentStatus}
        onChange={(e) => onChange("paymentStatus", e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
      </select>
    </div>
  );
}