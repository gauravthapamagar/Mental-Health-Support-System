// ============================================================
// FILE: app/patient/appointments/payment/verify/page.tsx  (NEW FILE)
// ============================================================
// This page handles the Khalti redirect after payment.
// Khalti redirects to: /patient/appointments/payment/verify?pidx=xxx&...
// The page extracts pidx and calls the backend to verify.
// ============================================================

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentAPI } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [message, setMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const verifyPayment = useCallback(async () => {
    // Khalti sends these query params on redirect:
    // ?pidx=xxx&transaction_id=xxx&tidx=xxx&amount=xxx&total_amount=xxx
    // &mobile=xxx&status=xxx&purchase_order_id=xxx&purchase_order_name=xxx
    const pidx = searchParams.get("pidx");
    const purchaseOrderId = searchParams.get("purchase_order_id");
    const khaltiStatus = searchParams.get("status");

    if (!pidx) {
      setStatus("failed");
      setMessage("Invalid payment response. No payment identifier found.");
      return;
    }

    // Extract appointment ID from purchase_order_id (format: "APT-123")
    let appointmentId: number | null = null;
    if (purchaseOrderId) {
      const match = purchaseOrderId.match(/APT-(\d+)/);
      if (match) {
        appointmentId = parseInt(match[1], 10);
      }
    }

    if (!appointmentId) {
      setStatus("failed");
      setMessage("Could not identify the appointment for this payment.");
      return;
    }

    // If Khalti already reports a non-completed status
    if (khaltiStatus && khaltiStatus.toLowerCase() !== "completed") {
      setStatus("failed");
      setMessage(
        `Payment was not completed. Khalti status: ${khaltiStatus}. Please try again.`
      );
      return;
    }

    try {
      const response = await paymentAPI.verifyPayment(pidx, appointmentId);
      setStatus("success");
      setMessage(response.message || "Payment verified successfully!");
      setTransactionId(
        response.payment?.khalti_transaction_id || searchParams.get("transaction_id") || ""
      );
    } catch (error: any) {
      setStatus("failed");
      const errorMsg =
        error.response?.data?.error ||
        "Payment verification failed. Please contact support.";
      setMessage(errorMsg);
    }
  }, [searchParams]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === "verifying" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your payment with Khalti...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {transactionId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono font-semibold text-gray-900">
                  {transactionId}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Your appointment has been moved to Upcoming. You can now view your
              session details.
            </p>
            <Link
              href="/patient/appointments"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
            >
              <ArrowLeft size={18} />
              Back to Appointments
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/patient/appointments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
                <CreditCard size={18} />
                Try Again
              </Link>
              <Link
                href="/patient/appointments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                <ArrowLeft size={18} />
                Back to Appointments
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it
export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
