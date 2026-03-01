"use client";

import { useEffect, useState } from "react";
import "../register/register.css";

export default function PaymentPage() {
  const [teamId, setTeamId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Not Paid");

  useEffect(() => {
    const id = localStorage.getItem("teamId");
    if (id) {
      setTeamId(id);
    }
  }, []);

  const handlePayment = () => {
    const options = {
      key: "rzp_test_YourTestKeyHere",
      amount: 5000,
      currency: "INR",
      name: "Startup Auction",
      description: "Team Registration Fee",
      handler: function () {
        setPaymentStatus("Paid ✅");
      },
      theme: {
        color: "#6c5ce7",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="form-container">
      <h1>💳 Complete Payment</h1>

      {teamId ? (
        <>
          <p>Team ID: {teamId}</p>

          <button className="submit-btn" onClick={handlePayment}>
            Pay ₹50
          </button>

          <div className="payment-status">
            Status: <span>{paymentStatus}</span>
          </div>
        </>
      ) : (
        <p>No Team Found</p>
      )}
    </div>
  );
}