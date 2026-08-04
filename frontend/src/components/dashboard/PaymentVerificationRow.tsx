import { useState } from "react";
import toast from "react-hot-toast";
import { Check, X, Loader2 } from "lucide-react";

import { approveTransaction, rejectTransaction } from "../../api/transaction.api";
import type { Transaction } from "../../api/transaction.api";
import { formatIDR } from "../../utils/currency";
import { getErrorMessage } from "../../utils/error";

interface PaymentVerificationRowProps {
  transaction: Transaction;
  onActioned: () => void;
}

const PaymentVerificationRow = ({
  transaction,
  onActioned,
}: PaymentVerificationRowProps) => {
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null
  );

  const handleApprove = async () => {
    try {
      setSubmitting("approve");
      await approveTransaction(transaction.id);
      toast.success("Transaction approved successfully.");
      onActioned();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve transaction."));
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting("reject");
      await rejectTransaction(transaction.id);
      toast.success("Transaction rejected successfully.");
      onActioned();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject transaction."));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {transaction.paymentProof ? (
          <a
            href={transaction.paymentProof}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <img
              src={transaction.paymentProof}
              alt="Payment proof"
              className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
            />
          </a>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400">
            No proof
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {transaction.conference?.title ?? "Conference"}
          </p>
          <p className="text-xs text-slate-500">
            {transaction.user?.fullName ?? "Attendee"}
            {transaction.user?.email ? ` (${transaction.user.email})` : ""}
          </p>
          <p className="text-xs text-slate-500">
            {transaction.ticketType?.name ?? "Ticket"} × {transaction.quantity}{" "}
            — {formatIDR(transaction.totalPrice)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={submitting !== null}
          onClick={handleApprove}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "approve" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Approve
        </button>
        <button
          type="button"
          disabled={submitting !== null}
          onClick={handleReject}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "reject" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <X size={14} />
          )}
          Reject
        </button>
      </div>
    </div>
  );
};

export default PaymentVerificationRow;
