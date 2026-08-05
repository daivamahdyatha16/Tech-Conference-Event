import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Building2,
  Ticket,
  User,
  Star,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { useConferenceDetail } from "../../hooks/useConferenceDetail";
import { useTicketTypes } from "../../hooks/useTicketTypes";
import { useReviews } from "../../hooks/useReviews";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { usePromotion } from "../../hooks/usePromotion";
import { createTransaction } from "../../api/transaction.api";
import { createReview } from "../../api/review.api";
import { formatIDR } from "../../utils/currency";
import { getConferenceTimeStatus } from "../../utils/conferenceStatus";
import { formatDateRange } from "../../utils/datetime";
import { getErrorMessage } from "../../utils/error";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import ImagePlaceholder from "../../components/ui/ImagePlaceholder";
import ConferenceStatusBadge from "../../components/conference/ConferenceStatusBadge";

import conferencePlaceholderImage from "../../assets/images/conference-placeholder.webp";

const StarRating = ({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
        }
      />
    ))}
  </div>
);

const ConferenceDetail = () => {
  const { id } = useParams();
  const conferenceId = Number(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { conference, loading, error } = useConferenceDetail(conferenceId);
  const {
    ticketTypes,
    loading: ticketTypesLoading,
    error: ticketTypesError,
    refetch: refetchTicketTypes,
  } = useTicketTypes(conferenceId);

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useReviews(conferenceId);

  const { pointBalance, coupons, refetch: refetchWallet } = useWallet();
  const { promotion } = usePromotion(conferenceId);

  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    number | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(
    null
  );
  const [pointsToUse, setPointsToUse] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    : null;

  const conferenceEnded = conference
    ? getConferenceTimeStatus(conference.startDate, conference.endDate) ===
      "Ended"
    : false;

  const hasReviewed =
    isAuthenticated && reviews.some((review) => review.userId === user?.id);

  const reviewGateMessage = !isAuthenticated
    ? "Log in to write a review for this conference."
    : !conferenceEnded
    ? "You can review this conference after it has ended."
    : hasReviewed
    ? "You have already reviewed this conference."
    : "";

  const canWriteReview = !reviewGateMessage;

  const isOrganizer = user?.role === "ORGANIZER";

  const selectedTicketType = ticketTypes.find(
    (ticketType) => ticketType.id === selectedTicketTypeId
  );

  const totalPayment = selectedTicketType
    ? selectedTicketType.price * quantity
    : 0;

  const selectedCoupon = coupons.find(
    (coupon) => coupon.id === selectedCouponId
  );

  
  const promotionDiscount = promotion
    ? promotion.discountType === "PERCENTAGE"
      ? (totalPayment * promotion.discountValue) / 100
      : promotion.discountValue
    : 0;

  const afterPromotion = Math.max(0, totalPayment - promotionDiscount);

  const couponDiscount = selectedCoupon
    ? selectedCoupon.discountType === "PERCENTAGE"
      ? (afterPromotion * selectedCoupon.discountValue) / 100
      : selectedCoupon.discountValue
    : 0;

  const afterCoupon = Math.max(0, afterPromotion - couponDiscount);

  const appliedPoints = Math.min(Number(pointsToUse) || 0, afterCoupon);

  const estimatedTotal = Math.max(0, afterCoupon - appliedPoints);

  const handleSelectTicketType = (ticketTypeId: number) => {
    setSelectedTicketTypeId(ticketTypeId);
    setQuantity(1);
    setSelectedCouponId(null);
    setPointsToUse("");
  };

  const clampQuantity = (value: number, max: number) =>
    Math.max(1, Math.min(max, value));

  const handleQuantityChange = (value: number) => {
    if (!selectedTicketType) return;
    setQuantity(clampQuantity(value, selectedTicketType.availableSeat));
  };

  const handlePointsChange = (rawValue: string) => {
    if (rawValue === "") {
      setPointsToUse("");
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;

    const maxUsablePoints = Math.min(pointBalance, totalPayment);
    setPointsToUse(Math.max(0, Math.min(parsed, maxUsablePoints)));
  };

  const handleBuyTicket = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/conferences/${conferenceId}` } } });
      return;
    }

    if (isOrganizer) {
      toast.error("Organizer accounts cannot purchase tickets.");
      return;
    }

    if (!selectedTicketType) {
      toast.error("Pilih jenis tiket terlebih dahulu.");
      return;
    }

    if (quantity < 1 || quantity > selectedTicketType.availableSeat) {
      toast.error("Jumlah tiket tidak valid.");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Beli tiket ini?",
      text: `${selectedTicketType.name} × ${quantity} — ${
        conference?.isFree ? "Gratis" : formatIDR(estimatedTotal)
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, beli",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);

      const response = await createTransaction({
        ticketTypeId: selectedTicketType.id,
        quantity,
        ...(selectedCouponId ? { couponId: selectedCouponId } : {}),
        ...(Number(pointsToUse) > 0
          ? { pointUsed: Number(pointsToUse) }
          : {}),
      });

      if (conference?.isFree) {
        toast.success("Tiket berhasil didapatkan! Transaksi kamu sudah tercatat.");
      } else {
        const expiresAt = new Date(response.data.expiresAt).toLocaleString(
          "id-ID"
        );

        toast.success(
          `Transaksi berhasil dibuat. Diskon: ${formatIDR(
            response.data.discount
          )}. Total pembayaran: ${formatIDR(
            response.data.totalPrice
          )}. Selesaikan sebelum ${expiresAt}.`
        );
      }

      setSelectedTicketTypeId(null);
      setQuantity(1);
      setSelectedCouponId(null);
      setPointsToUse("");
      refetchTicketTypes();
      refetchWallet();
      navigate("/dashboard", { state: { tab: "WAITING_PAYMENT" } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal membuat transaksi."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1) {
      toast.error("Pilih rating terlebih dahulu.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Komentar tidak boleh kosong.");
      return;
    }

    try {
      setSubmittingReview(true);

      await createReview({
        conferenceId,
        rating,
        comment: comment.trim(),
      });

      setRating(0);
      setComment("");
      refetchReviews();
      toast.success("Review berhasil dikirim!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengirim review."));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="mb-8 h-[320px] w-full rounded-3xl sm:h-[420px]" />

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">
          {error ? "Something went wrong" : "Conference not found"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {error ||
            "The conference you're looking for doesn't exist or has been removed."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 overflow-hidden rounded-3xl shadow-xl shadow-slate-900/10">
        <ImagePlaceholder
          src={conference.thumbnail ?? conferencePlaceholderImage}
          alt={conference.title}
          className="h-[320px] w-full sm:h-[420px]"
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
              {conference.category.name}
            </span>

            <ConferenceStatusBadge
              startDate={conference.startDate}
              endDate={conference.endDate}
            />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {conference.title}
          </h1>

          <p className="mt-4 leading-relaxed text-slate-600">
            {conference.description}
          </p>

          <div className="mt-8 grid gap-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  City
                </p>
                <p className="font-semibold text-slate-900">
                  {conference.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Venue
                </p>
                <p className="font-semibold text-slate-900">
                  {conference.venue}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Event Date
                </p>
                <p className="font-semibold text-slate-900">
                  {formatDateRange(conference.startDate, conference.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Ticket size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Price
                </p>
                <p className="font-semibold">
                  {conference.isFree ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    <span className="text-amber-600">Paid Event</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Organizer
                </p>
                <p className="font-semibold text-slate-900">
                  {conference.organizer?.fullName ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Reviews &amp; Ratings
              </h2>

              {averageRating !== null && (
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(averageRating)} />
                  <span className="text-sm text-slate-500">
                    {averageRating.toFixed(1)} ({reviews.length} review
                    {reviews.length > 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {canWriteReview ? (
              <form
                onSubmit={handleSubmitReview}
                className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-5"
              >
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Your Rating
                  </p>
                  <div
                    className="flex gap-1"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        aria-label={`Rate ${star} star`}
                        className="transition-transform duration-150 hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (hoveredRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience about this conference..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            ) : (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-sm text-slate-500">
                {!isAuthenticated ? (
                  <>
                    <LogIn size={18} className="shrink-0 text-slate-400" />
                    <span>
                      {reviewGateMessage}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/login", {
                            state: {
                              from: { pathname: `/conferences/${conferenceId}` },
                            },
                          })
                        }
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Log in
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} className="shrink-0 text-slate-400" />
                    <span>{reviewGateMessage}</span>
                  </>
                )}
              </div>
            )}

            <div className="mt-6">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="space-y-2 py-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : reviewsError ? (
                <p className="py-10 text-center text-sm text-red-500">
                  {reviewsError}
                </p>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                  <p className="text-sm text-slate-500">
                    No reviews yet. Be the first to review this conference.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <div key={review.id} className="py-5">
                      <div className="flex items-center justify-between">
                        <StarRating value={review.rating} />
                        <span className="text-xs text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {review.user?.fullName ?? "Anonymous"}
                      </p>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket purchase sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Tickets
            </h2>

            {isOrganizer ? (
              <p className="mt-5 text-sm text-slate-500">
                Organizer accounts can't purchase tickets. Log in as an
                attendee to buy tickets for this conference.
              </p>
            ) : ticketTypesLoading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : ticketTypesError ? (
              <p className="mt-5 text-sm text-red-500">{ticketTypesError}</p>
            ) : ticketTypes.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                No tickets available for this conference yet.
              </p>
            ) : (
              <>
                <div className="mt-5 space-y-3">
                  {ticketTypes.map((ticketType) => {
                    const soldOut = ticketType.availableSeat <= 0;
                    const isSelected = ticketType.id === selectedTicketTypeId;

                    return (
                      <label
                        key={ticketType.id}
                        className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        } ${soldOut ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="ticketType"
                            checked={isSelected}
                            disabled={soldOut}
                            onChange={() =>
                              handleSelectTicketType(ticketType.id)
                            }
                            className="mt-1 h-4 w-4 accent-blue-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {ticketType.name}
                            </p>
                            {ticketType.description && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {ticketType.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {soldOut
                                ? "Sold out"
                                : `${ticketType.availableSeat} seats left`}
                            </p>
                          </div>
                        </div>

                        <p className="whitespace-nowrap text-sm font-bold text-blue-600">
                          {ticketType.price === 0
                            ? "Free"
                            : formatIDR(ticketType.price)}
                        </p>
                      </label>
                    );
                  })}
                </div>

                {selectedTicketType && (
                  <div className="mt-5 space-y-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Quantity
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-6 text-center text-sm font-semibold text-slate-900">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= selectedTicketType.availableSeat}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {!conference.isFree && (
                      <>
                        {coupons.length > 0 && (
                          <div className="space-y-2 border-t border-gray-200 pt-3">
                            <p className="text-sm font-medium text-slate-700">
                              Referral Coupon
                            </p>
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                              <input
                                type="radio"
                                name="coupon"
                                checked={selectedCouponId === null}
                                onChange={() => setSelectedCouponId(null)}
                                className="h-4 w-4 accent-blue-600"
                              />
                              Don't use a coupon
                            </label>
                            {coupons.map((coupon) => (
                              <label
                                key={coupon.id}
                                className="flex items-center gap-2 text-sm text-slate-600"
                              >
                                <input
                                  type="radio"
                                  name="coupon"
                                  checked={selectedCouponId === coupon.id}
                                  onChange={() =>
                                    setSelectedCouponId(coupon.id)
                                  }
                                  className="h-4 w-4 accent-blue-600"
                                />
                                {coupon.discountType === "PERCENTAGE"
                                  ? `${coupon.discountValue}% discount coupon`
                                  : `${formatIDR(
                                      coupon.discountValue
                                    )} discount coupon`}
                              </label>
                            ))}
                          </div>
                        )}

                        {pointBalance > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                            <label
                              htmlFor="pointsToUse"
                              className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                              Use Points (Balance: {pointBalance.toLocaleString(
                                "id-ID"
                              )})
                            </label>
                            <input
                              id="pointsToUse"
                              type="number"
                              min={0}
                              max={Math.min(pointBalance, totalPayment)}
                              value={pointsToUse}
                              onChange={(e) =>
                                handlePointsChange(e.target.value)
                              }
                              placeholder="0"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5 border-t border-gray-200 pt-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              Ticket Subtotal
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatIDR(totalPayment)}
                            </span>
                          </div>

                          {promotion && promotionDiscount > 0 && (
                            <div className="flex items-center justify-between text-emerald-600">
                              <span>Promotion</span>
                              <span>-{formatIDR(promotionDiscount)}</span>
                            </div>
                          )}

                          {selectedCoupon && couponDiscount > 0 && (
                            <div className="flex items-center justify-between text-emerald-600">
                              <span>Coupon</span>
                              <span>-{formatIDR(couponDiscount)}</span>
                            </div>
                          )}

                          {appliedPoints > 0 && (
                            <div className="flex items-center justify-between text-emerald-600">
                              <span>Points Used</span>
                              <span>-{formatIDR(appliedPoints)}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
                            <span className="font-medium text-slate-700">
                              Estimated Total
                            </span>
                            <span className="text-lg font-bold text-slate-900">
                              {formatIDR(estimatedTotal)}
                            </span>
                          </div>

                          <p className="pt-1 text-xs text-slate-400">
                            Final price is confirmed by the server after
                            checkout.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {!isOrganizer && (
              <Button
                onClick={handleBuyTicket}
                disabled={(isAuthenticated && !selectedTicketType) || submitting}
                className="mt-6 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : isAuthenticated ? (
                  "Buy Ticket"
                ) : (
                  "Log in to Buy Ticket"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceDetail;
