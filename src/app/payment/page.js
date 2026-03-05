"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");
  const [paymentStatus, setPaymentStatus] = useState("Not Paid");
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setSdkLoaded(loaded);
      if (!loaded) {
        setPaymentError("Unable to load payment gateway. Please refresh and try again.");
      }
    });
  }, []);

  const handlePayment = () => {
    setPaymentError("");

    if (!sdkLoaded || typeof window === "undefined" || !window.Razorpay) {
      setPaymentError("Payment gateway is not ready yet. Please wait and try again.");
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setPaymentError("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.");
      return;
    }

    setIsPaying(true);

    const options = {
      key: razorpayKey,
      amount: 100,
      currency: "INR",
      name: "Startup Auction",
      description: "Team Registration Fee",
      handler: async function () {
        try {
          if (!teamId) {
            throw new Error("Missing teamId in payment URL");
          }

          const res = await fetch(`/api/teams/markPaid/${teamId}`, {
            method: "PATCH",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Failed to update payment status");

          setPaymentStatus("Paid");
          router.push(`/team/dashboard?teamId=${teamId}`);
        } catch (err) {
          setPaymentError(err.message || "Payment captured but status update failed");
        } finally {
          setIsPaying(false);
        }
      },
      modal: {
        ondismiss: function () {
          setIsPaying(false);
        },
      },
      theme: {
        color: "#6c5ce7",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setPaymentError("Failed to start payment. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Complete Payment</h1>

      {teamId ? (
        <>
          <p className="text-black font-bold">Team ID: {teamId}</p>

          <button className="submit-btn" onClick={handlePayment} disabled={isPaying}>
            {isPaying ? "Processing..." : "Pay INR 60"}
          </button>

          {paymentError ? <p className="text-red-600 mt-2">{paymentError}</p> : null}

          <div className="payment-status text-black font-bold">
            Status: <span>{paymentStatus}</span>
          </div>
        </>
      ) : (
        <p>No Team Found</p>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="form-container"><p>Loading payment page...</p></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
