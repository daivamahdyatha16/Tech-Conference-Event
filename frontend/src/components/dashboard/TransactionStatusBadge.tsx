const statusStyles: Record<string, string> = {
  WAITING_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-200",
  WAITING_CONFIRMATION: "bg-blue-50 text-blue-700 ring-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

const statusLabels: Record<string, string> = {
  WAITING_PAYMENT: "Waiting for Payment",
  WAITING_CONFIRMATION: "Waiting for Confirmation",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Expired",
};

interface TransactionStatusBadgeProps {
  status: string;
}

const TransactionStatusBadge = ({ status }: TransactionStatusBadgeProps) => (
  <span
    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
      statusStyles[status] ?? "bg-slate-100 text-slate-500 ring-slate-200"
    }`}
  >
    {statusLabels[status] ?? status}
  </span>
);

export default TransactionStatusBadge;
