import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Download, 
  Loader2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar, 
  DollarSign, 
  Ticket, 
  CheckCircle2, 
  LayoutDashboard,
  X,
  MapPin,
  Tag,
  BarChart3,
  Filter
} from "lucide-react";
import toast from "react-hot-toast";

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

type TabKey = "overview" | "conferences" | "verifications";
type ChartRange = "daily" | "monthly" | "yearly";

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [chartRange, setChartRange] = useState<ChartRange>("monthly");
  const [isExporting, setIsExporting] = useState(false);

  const [selectedConferenceId, setSelectedConferenceId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [selectedEventForModal, setSelectedEventForModal] = useState<any | null>(null);

  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { events, totalEvents, loading: eventsLoading, refetch: refetchEvents } = useDashboardEvents();
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useOrganizerTransactions();

  const loading = statsLoading || eventsLoading || transactionsLoading;

  const handlePaymentActioned = () => {
    refetchTransactions();
    refetchStats();
    refetchEvents();
  };

  const filteredOverviewTransactions = useMemo(() => {
    if (!selectedConferenceId) return transactions;
    return transactions.filter(
      (t) => String(t.conferenceId) === String(selectedConferenceId)
    );
  }, [transactions, selectedConferenceId]);

  const overviewStats = useMemo(() => {
    const approved = filteredOverviewTransactions.filter((t) => t.status === "APPROVED");
    const totalTicketsSold = approved.reduce((sum, t) => sum + (t.quantity || 1), 0);
    const totalRevenue = approved.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
    const pendingCount = filteredOverviewTransactions.filter((t) => t.status === "WAITING_CONFIRMATION").length;

    return {
      totalTicketsSold: selectedConferenceId ? totalTicketsSold : stats.totalTicketsSold,
      totalRevenue: selectedConferenceId ? totalRevenue : stats.totalRevenue,
      pendingCount,
    };
  }, [filteredOverviewTransactions, selectedConferenceId, stats]);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const approvedTransactions = filteredOverviewTransactions.filter(
        (t) => t.status === "APPROVED"
      );

      if (approvedTransactions.length === 0) {
        toast.error("No approved transactions to export for this selection.");
        setIsExporting(false);
        return;
      }

      const headers = [
        "Transaction ID",
        "Conference Title",
        "Quantity",
        "Total Price (IDR)",
        "Status",
        "Date"
      ];

      const rows = approvedTransactions.map((t) => [
        `"${t.id}"`,
        `"${t.conference?.title || "Conference"}"`,
        t.quantity || 1,
        t.totalPrice || 0,
        `"${t.status}"`,
        `"${new Date((t as any).createdAt || Date.now()).toLocaleDateString("id-ID")}"`
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" + // \uFEFF adalah BOM agar koma/karakter spesial terbaca rapi di Excel
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const fileName = selectedConferenceId
        ? `sales_report_event_${selectedConferenceId}_${Date.now()}.csv`
        : `sales_report_all_events_${Date.now()}.csv`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("CSV Report exported successfully!");
    } catch (err) {
      toast.error("Failed to generate CSV report.");
    } finally {
      setIsExporting(false);
    }
  };

  const pendingVerificationAll = useMemo(
    () => transactions.filter((t) => t.status === "WAITING_CONFIRMATION"),
    [transactions]
  );

  const chartData = useMemo(() => {
    const approvedTransactions = filteredOverviewTransactions.filter((t) => t.status === "APPROVED");

    if (chartRange === "daily") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          dateStr: d.toISOString().split("T")[0],
          label: dayNames[d.getDay()],
          amount: 0,
        };
      });

      approvedTransactions.forEach((t) => {
        const dateRaw = t.createdAt || (t as any).updatedAt;
        if (!dateRaw) return;
        const txDate = new Date(dateRaw).toISOString().split("T")[0];
        const target = last7Days.find((d) => d.dateStr === txDate);
        if (target) {
          target.amount += t.totalPrice || 0;
        }
      });

      return last7Days.map(({ label, amount }) => ({ label, amount }));
    }

    if (chartRange === "monthly") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthlyData = months.map((m) => ({ label: m, amount: 0 }));

      approvedTransactions.forEach((t) => {
        const dateRaw = t.createdAt || (t as any).updatedAt;
        if (!dateRaw) return;
        const d = new Date(dateRaw);
        if (d.getFullYear() === currentYear) {
          monthlyData[d.getMonth()].amount += t.totalPrice || 0;
        }
      });

      return monthlyData;
    }

    if (chartRange === "yearly") {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear];
      const yearlyData = years.map((y) => ({ label: String(y), amount: 0 }));

      approvedTransactions.forEach((t) => {
        const dateRaw = t.createdAt || (t as any).updatedAt;
        if (!dateRaw) return;
        const year = new Date(dateRaw).getFullYear();
        const target = yearlyData.find((y) => y.label === String(year));
        if (target) {
          target.amount += t.totalPrice || 0;
        }
      });

      return yearlyData;
    }

    return [];
  }, [filteredOverviewTransactions, chartRange]);

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount)) || 1;

  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "conferences", label: `My Conferences (${totalEvents || events.length})`, icon: Calendar },
    { key: "verifications", label: "Payment Verifications", icon: CheckCircle2, badge: pendingVerificationAll.length },
  ];

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              <Button variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <Plus size={16} />
                Create Conference
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Filter size={15} className="text-blue-600" />
                    <span>Filter Overview Data:</span>
                  </div>
                  <select
                    value={selectedConferenceId}
                    onChange={(e) => setSelectedConferenceId(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">All Conferences ({events.length})</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Conferences</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Calendar size={16} />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {selectedConferenceId ? 1 : totalEvents}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tickets Sold</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Ticket size={16} />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{overviewStats.totalTicketsSold}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <DollarSign size={16} />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{formatIDR(overviewStats.totalRevenue)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Verification</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{overviewStats.pendingCount}</p>
                  </div>
                </div>

                {/* SALES CHART SECTION */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-600" /> Transaction & Revenue Analytics
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedConferenceId
                          ? `Showing analytics for: ${events.find((e) => String(e.id) === selectedConferenceId)?.title}`
                          : "Showing analytics for all conferences"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
                        <button
                          type="button"
                          onClick={() => setChartRange("daily")}
                          className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                            chartRange === "daily" ? "bg-white text-blue-600 font-bold shadow-sm" : "hover:text-slate-900"
                          }`}
                        >
                          Daily
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartRange("monthly")}
                          className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                            chartRange === "monthly" ? "bg-white text-blue-600 font-bold shadow-sm" : "hover:text-slate-900"
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartRange("yearly")}
                          className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                            chartRange === "yearly" ? "bg-white text-blue-600 font-bold shadow-sm" : "hover:text-slate-900"
                          }`}
                        >
                          Yearly
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                      >
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {isExporting ? "Exporting..." : "Export CSV"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex h-52 items-end justify-between gap-3 border-b border-slate-100 pb-2 px-2">
                      {chartData.map((data, idx) => {
                        const heightPercent = data.amount > 0 ? Math.max(12, Math.round((data.amount / maxChartAmount) * 100)) : 4;
                        return (
                          <div key={idx} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg font-mono whitespace-nowrap shadow-lg pointer-events-none z-10">
                              {formatIDR(data.amount)}
                            </div>
                            
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${
                                data.amount > 0 
                                  ? "bg-linear-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400" 
                                  : "bg-slate-100"
                              }`}
                            />
                            
                            <span className="mt-2 text-[11px] font-medium text-slate-500">{data.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "conferences" && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search conference by title or city..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-175">
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Conference</th>
                        <th className="py-3 px-4">Location & Category</th>
                        <th className="py-3 px-4 text-center">Remaining Seats</th>
                        <th className="py-3 px-4 text-right">Revenue</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedEvents.length > 0 ? (
                        paginatedEvents.map((event) => {
                          const remainingSeats = event.ticketTypes.reduce(
                            (sum, tt) => sum + (tt.availableSeat ?? 0),
                            0
                          );
                          const revenue = transactions
                            .filter((t) => t.conferenceId === event.id && t.status === "APPROVED")
                            .reduce((sum, t) => sum + t.totalPrice, 0);

                          return (
                            <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={event.thumbnail ?? conferencePlaceholderImage}
                                    alt={event.title}
                                    className="h-11 w-14 rounded-lg object-cover border border-slate-100 shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 text-xs line-clamp-1">{event.title}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {new Date(event.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-slate-800 flex items-center gap-1">
                                  <MapPin size={12} className="text-slate-400" /> {event.city}
                                </p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Tag size={10} className="text-slate-400" /> {event.category.name}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                                  {remainingSeats} seats
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900">
                                {formatIDR(revenue)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedEventForModal(event)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <Eye size={13} /> View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No conferences found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-800 outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <span>items per page</span>
                  </div>

                  {filteredEvents.length > 0 && (
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <p className="text-slate-500">
                        Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
                        <span className="font-semibold text-slate-800">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "verifications" && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Pending Payment Verifications</h2>
                {pendingVerificationAll.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-xs text-slate-400">
                    No payments waiting for verification.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVerificationAll.map((t) => (
                      <PaymentVerificationRow
                        key={t.id}
                        transaction={t}
                        onActioned={handlePaymentActioned}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Conference Details</h3>
              <button
                type="button"
                onClick={() => setSelectedEventForModal(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={selectedEventForModal.thumbnail ?? conferencePlaceholderImage}
                alt={selectedEventForModal.title}
                className="h-20 w-28 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{selectedEventForModal.title}</h4>
                <p className="text-xs text-slate-500">{selectedEventForModal.city} · {selectedEventForModal.venue}</p>
                <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  {selectedEventForModal.category.name}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h5 className="text-xs font-bold text-slate-700 mb-2 uppercase">Ticket Types & Quota</h5>
              <div className="space-y-2">
                {selectedEventForModal.ticketTypes.map((tt: any) => (
                  <div key={tt.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                    <span className="font-semibold text-slate-800">{tt.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{formatIDR(tt.price)}</span>
                      <span className="font-bold text-blue-600">{tt.availableSeat} left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 justify-end">
              <Link to={`/conferences/${selectedEventForModal.id}`}>
                <Button variant="outline" className="px-3 py-1.5 text-xs">
                  Go to Public Page
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedEventForModal(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default OrganizerDashboard;