import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { UploadCloud, Loader2 } from "lucide-react";

import { uploadPaymentProof } from "../../api/transaction.api";
import type { Transaction } from "../../api/transaction.api";
import { formatIDR } from "../../utils/currency";
import { getErrorMessage } from "../../utils/error";
import Countdown from "./Countdown";
import TransactionStatusBadge from "./TransactionStatusBadge";

interface TransactionStatusCardProps {
  transaction: Transaction;
  onUploaded: () => void;
}

const TransactionStatusCard = ({
  transaction,
  onUploaded,
}: TransactionStatusCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isWaitingPayment = transaction.status === "WAITING_PAYMENT";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const confirmResult = await Swal.fire({
      title: "Upload this payment proof?",
      imageUrl: previewUrl,
      imageWidth: 240,
      imageAlt: "Payment proof preview",
      showCancelButton: true,
      confirmButtonText: "Yes, upload",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });

    URL.revokeObjectURL(previewUrl);

    if (!confirmResult.isConfirmed) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setUploading(true);

      await uploadPaymentProof(transaction.id, file);

      toast.success("Payment proof uploaded successfully!");
      onUploaded();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload payment proof."));
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {transaction.conference?.title ?? "Conference"}
          </p>
          <p className="text-xs text-slate-500">
            {transaction.ticketType?.name ?? "Ticket"} × {transaction.quantity}
          </p>
        </div>
        <p className="whitespace-nowrap text-sm font-bold text-slate-900">
          {formatIDR(transaction.totalPrice)}
        </p>
      </div>

      {isWaitingPayment ? (
        <>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
            <span className="text-xs font-medium text-amber-700">
              Expires in
            </span>
            <Countdown expiresAt={transaction.expiresAt} />
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload Payment Proof
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      ) : (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-medium text-slate-500">
            Awaiting organizer review
          </span>
          <TransactionStatusBadge status={transaction.status} />
        </div>
      )}
    </div>
  );
};

export default TransactionStatusCard;
