import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, QrCode, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { useMyTransactions } from "../../hooks/useMyTransactions";
import Container from "../../components/ui/Container";
import Skeleton from "../../components/ui/Skeleton";
import TransactionStatusBadge from "../../components/dashboard/TransactionStatusBadge";
import TransactionStatusCard from "../../components/dashboard/TransactionStatusCard";
import { formatIDR } from "../../utils/currency";
import logoIcon from "../../assets/logo/logo-icon.png";

type TabKey = "overview" | "wallet" | "transaction-status" | "history" | "profile";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "wallet", label: "Wallet" },
  { key: "transaction-status", label: "Transaction Status" },
  { key: "history", label: "Transaction History" },
  { key: "profile", label: "Profile" },
];

type HistoryFilter = "ALL" | "APPROVED" | "REJECTED" | "EXPIRED";

const historyFilters: { value: HistoryFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getBatchStatus = (batch: { remaining: number; expiredAt: string }) => {
  if (new Date(batch.expiredAt) <= new Date()) {
    return { label: "Expired", className: "bg-rose-100 text-rose-700" };
  }
  if (batch.remaining === 0) {
    return { label: "Used", className: "bg-slate-100 text-slate-600" };
  }
  return { label: "Active", className: "bg-emerald-100 text-emerald-700" };
};

const AttendeeDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const {
    pointBalance,
    pointBatches,
    coupons,
    pointHistory,
    loading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useWallet();

  const {
    transactions,
    loading,
    refetch: refetchTransactions,
  } = useMyTransactions();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const initialTab = (location.state as { tab?: string })?.tab;

    if (initialTab === "WAITING_PAYMENT") return "transaction-status";
    if (initialTab === "APPROVED") return "history";

    return "overview";
  });
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("ALL");

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const transactionStatusItems = transactions.filter(
    (t) => t.status === "WAITING_PAYMENT" || t.status === "WAITING_CONFIRMATION"
  );
  const historyTransactions = transactions.filter(
    (t) =>
      t.status === "APPROVED" ||
      t.status === "CANCELLED" ||
      t.status === "REJECTED"
  );
  const filteredHistoryTransactions = historyTransactions.filter((t) => {
    if (historyFilter === "ALL") return true;
    if (historyFilter === "EXPIRED") return t.status === "CANCELLED";
    return t.status === historyFilter;
  });

  const handleCopyReferralCode = async () => {
    if (!user?.referralCode) return;

    await navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8 flex items-start gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
          <img
            src={logoIcon}
            alt="TechCon Logo"
            className="hidden h-10 w-10 shrink-0 rounded-full bg-white/20 object-contain p-1.5 backdrop-blur-md sm:block"
          />
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
              Role: {user?.role ?? "ATTENDEE"}
            </span>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Welcome back, {user?.fullName ?? "User"}!
            </h1>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.key === "transaction-status" &&
                transactionStatusItems.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      activeTab === tab.key
                        ? "bg-white/20"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {transactionStatusItems.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Point Balance
                  </h2>
                  <p className="text-2xl font-bold text-slate-900">
                    {pointBalance.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Transaction Status
                  </h2>
                  <p className="text-2xl font-bold text-slate-900">
                    {transactionStatusItems.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Transactions
                  </h2>
                  <p className="text-2xl font-bold text-slate-900">
                    {transactions.length}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="space-y-6">
                {walletError && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                    <span>{walletError}</span>
                    <button
                      type="button"
                      onClick={refetchWallet}
                      className="self-start rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 cursor-pointer sm:self-auto"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {walletLoading ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Skeleton className="h-32" />
                      <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-48" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Point Balance
                        </h2>
                        <p className="text-3xl font-bold text-blue-600">
                          {pointBalance.toLocaleString("id-ID")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          1 point = Rp1. Points are used from the batch that expires first.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Referral Coupons
                        </h2>
                        {coupons.length === 0 ? (
                          <p className="text-sm text-slate-500">No coupons available.</p>
                        ) : (
                          <div className="space-y-2">
                            {coupons.map((coupon) => (
                              <div
                                key={coupon.id}
                                className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <span className="text-sm font-semibold text-slate-900">
                                  {coupon.discountType === "PERCENTAGE"
                                    ? `${coupon.discountValue}% off`
                                    : `${formatIDR(coupon.discountValue)} off`}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Expires {formatShortDate(coupon.expiredAt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">Point Batches</h3>
                        <p className="text-xs text-slate-500">
                          Each referral reward is valid for 3 months from the date it was earned.
                        </p>
                      </div>

                      {pointBatches.length === 0 ? (
                        <EmptyState message="No points yet. Share your referral code to earn 10.000 points per sign-up." />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-140 text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase font-semibold">
                              <tr>
                                <th className="py-3 px-4">Earned</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4 text-right">Remaining</th>
                                <th className="py-3 px-4 text-center">Expires On</th>
                                <th className="py-3 px-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {pointBatches.map((batch) => {
                                const status = getBatchStatus(batch);
                                return (
                                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 text-slate-600">
                                      {formatShortDate(batch.earnedAt)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-slate-600">
                                      {batch.amount.toLocaleString("id-ID")}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                      {batch.remaining.toLocaleString("id-ID")}
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-slate-500">
                                      {formatShortDate(batch.expiredAt)}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.className}`}
                                      >
                                        {status.label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">Points History</h3>
                        <p className="text-xs text-slate-500">
                          Points earned from referrals, used at checkout, and refunded from cancelled transactions.
                        </p>
                      </div>

                      {pointHistory.length === 0 ? (
                        <EmptyState message="No point history found." />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-140 text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase font-semibold">
                              <tr>
                                <th className="py-3 px-4">Source / Transaction</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4 text-right">Points</th>
                                <th className="py-3 px-4 text-center">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {pointHistory.map((item) => {
                                const isEarned = item.point > 0;
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 font-medium text-slate-800">
                                      {item.description || "Referral Points"}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                          isEarned
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {isEarned ? "EARNED" : "REDEEMED"}
                                      </span>
                                    </td>
                                    <td
                                      className={`py-3.5 px-4 text-right font-bold ${
                                        isEarned ? "text-emerald-600" : "text-rose-600"
                                      }`}
                                    >
                                      {isEarned ? "+" : "-"}
                                      {Math.abs(item.point).toLocaleString("id-ID")}
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-slate-500">
                                      {formatShortDate(item.createdAt)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "transaction-status" &&
              (transactionStatusItems.length === 0 ? (
                <EmptyState message="No transactions in progress." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {transactionStatusItems.map((t) => (
                    <TransactionStatusCard
                      key={t.id}
                      transaction={t}
                      onUploaded={refetchTransactions}
                    />
                  ))}
                </div>
              ))}

            {activeTab === "history" && (
              <div>
                <div className="mb-4 flex items-center justify-end">
                  <select
                    value={historyFilter}
                    onChange={(e) =>
                      setHistoryFilter(e.target.value as HistoryFilter)
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {historyFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredHistoryTransactions.length === 0 ? (
                  <EmptyState message="No transaction history yet." />
                ) : (
                  <div className="space-y-3">
                    {filteredHistoryTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {t.conference?.title ?? "Conference"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.ticketType?.name ?? "Ticket"} × {t.quantity} —{" "}
                            {formatIDR(t.totalPrice)}
                          </p>
                          {t.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(t)}
                              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-all cursor-pointer"
                            >
                              <QrCode size={13} /> View E-Ticket
                            </button>
                          )}
                        </div>
                        <TransactionStatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    User Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Full Name</p>
                      <p className="font-semibold text-slate-900">
                        {user?.fullName ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email Address</p>
                      <p className="font-semibold text-slate-900">
                        {user?.email ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    My Referral Code
                  </h2>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200/60">
                    <span className="font-mono text-lg font-bold tracking-wider text-blue-600">
                      {user?.referralCode ?? "-"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyReferralCode}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-100 cursor-pointer"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">E-Ticket & Details</h3>
                <p className="text-xs text-slate-400 font-mono">Invoice #{selectedTicket.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <QrCode className="h-28 w-28 text-slate-800" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Show this QR Code at the entrance</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Conference</span>
                <span className="font-semibold text-slate-900">{selectedTicket.conference?.title ?? "Conference"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ticket Type</span>
                <span className="font-semibold text-slate-900">{selectedTicket.ticketType?.name ?? "Ticket"} ({selectedTicket.quantity} Qty)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Price</span>
                <span className="font-bold text-blue-600">{formatIDR(selectedTicket.totalPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AttendeeDashboard;