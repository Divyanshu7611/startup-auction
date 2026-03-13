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
      amount: 6000, // 1 INR in paise (Razorpay uses paise)
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
            credentials: "include",
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
    <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="form-container mx-auto w-full min-w-0 max-w-[420px] rounded-2xl bg-white px-5 py-6 shadow-lg ring-1 ring-slate-200/60 sm:max-w-[480px] sm:px-8 sm:py-8">
        <h1 className="text-center text-xl font-semibold text-slate-900 sm:text-2xl">Complete Payment</h1>

        {teamId ? (
          <>
            <p className="mt-4 break-words text-sm font-medium text-slate-700 sm:text-base">Team ID: <span className="font-mono">{teamId}</span></p>

            <button
              className="submit-btn mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl border-0 bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60 sm:min-h-[52px]"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? "Processing..." : "Pay INR 60"}
            </button>

            {paymentError ? <p className="mt-3 break-words text-sm text-red-600 sm:text-base">{paymentError}</p> : null}

            <div className="payment-status mt-4 text-sm font-semibold text-slate-800 sm:text-base">
              Status: <span>{paymentStatus}</span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-slate-600">No Team Found</p>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full min-w-0 items-center justify-center px-4">
          <p className="text-slate-600">Loading payment page...</p>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
