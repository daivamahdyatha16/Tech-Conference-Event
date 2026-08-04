import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy } from "lucide-react";
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

const AttendeeDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { pointBalance, coupons } = useWallet();
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Point Balance
                  </h2>
                  <p className="text-3xl font-bold text-blue-600">
                    {pointBalance.toLocaleString("id-ID")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Points can be redeemed at checkout to reduce the ticket
                    price.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Referral Coupons
                  </h2>
                  {coupons.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No coupons available.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5"
                        >
                          <span className="text-sm font-semibold text-slate-900">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}% off`
                              : `${formatIDR(coupon.discountValue)} off`}
                          </span>
                          <span className="text-xs text-slate-400">
                            Expires{" "}
                            {new Date(coupon.expiredAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                          <p className="mt-1 text-xs font-medium text-emerald-600">
                            Payment Verified · Ticket ID: #{t.id}
                          </p>
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
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-100"
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
    </Container>
  );
};

export default AttendeeDashboard;
