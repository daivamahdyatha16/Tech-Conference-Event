import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useDashboardEvents } from "../../hooks/useDashboardEvents";
import { useOrganizerTransactions } from "../../hooks/useOrganizerTransactions";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import PaymentVerificationRow from "../../components/dashboard/PaymentVerificationRow";
import { formatIDR } from "../../utils/currency";
import conferencePlaceholderImage from "../../assets/images/conference-placeholder.webp";
import logoIcon from "../../assets/logo/logo-icon.png";

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();
  const {
    events,
    totalEvents,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useDashboardEvents();
  const {
    transactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useOrganizerTransactions();

  const loading = statsLoading || eventsLoading || transactionsLoading;

  const handlePaymentActioned = () => {
    refetchTransactions();
    refetchStats();
    refetchEvents();
  };

  const pendingVerification = transactions.filter(
    (t) => t.status === "WAITING_CONFIRMATION"
  );

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={logoIcon}
                alt="TechCon Logo"
                className="hidden h-10 w-10 shrink-0 rounded-full bg-white/20 object-contain p-1.5 backdrop-blur-md sm:block"
              />
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                  Role: ORGANIZER
                </span>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Welcome back, {user?.fullName ?? "Organizer"}!
                </h1>
              </div>
            </div>

            <Link to="/create-conference">
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus size={16} />
                Create Conference
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Conferences
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {totalEvents}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tickets Sold
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalTicketsSold}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revenue
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {formatIDR(stats.totalRevenue)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pending Payment Verification
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingVerification.length}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
                Payment Verification
              </h2>
              {pendingVerification.length === 0 ? (
                <EmptyState message="No payments waiting for verification." />
              ) : (
                <div className="space-y-3">
                  {pendingVerification.map((t) => (
                    <PaymentVerificationRow
                      key={t.id}
                      transaction={t}
                      onActioned={handlePaymentActioned}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
                My Conferences
              </h2>
              {events.length === 0 ? (
                <EmptyState message="You haven't created any conferences yet." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {events.map((event) => {
                    const remainingSeats = event.ticketTypes.reduce(
                      (sum, tt) => sum + tt.availableSeat,
                      0
                    );
                    const revenue = transactions
                      .filter(
                        (t) =>
                          t.conferenceId === event.id &&
                          t.status === "APPROVED"
                      )
                      .reduce((sum, t) => sum + t.totalPrice, 0);
                    const pendingPayments = transactions.filter(
                      (t) =>
                        t.conferenceId === event.id &&
                        t.status === "WAITING_CONFIRMATION"
                    ).length;

                    return (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <img
                          src={event.thumbnail ?? conferencePlaceholderImage}
                          alt={event.title}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                        <p className="text-sm font-semibold text-slate-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {event.city} · {event.category.name}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {remainingSeats}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Remaining Seats
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {formatIDR(revenue)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Revenue
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {pendingPayments}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Pending Payments
                            </p>
                          </div>
                        </div>

                        <Link to={`/conferences/${event.id}`}>
                          <Button
                            variant="outline"
                            className="mt-4 w-full"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default OrganizerDashboard;
