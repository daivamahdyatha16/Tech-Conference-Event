const pad = (value: number) => String(value).padStart(2, "0");

/** Returns tomorrow's date at 00:00 as a `datetime-local` compatible string. */
export const getMinStartDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate()
  )}T00:00`;
};

/**
 * Formats an event's start/end date as a single date ("17 Agustus 2026") when
 * they're the same day, a same-month range ("17–20 Agustus 2026"), or a
 * cross-month range ("31 Agustus – 2 September 2026").
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  locale = "id-ID"
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return start.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const endFormatted = end.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (sameMonth) {
    const startDay = start.toLocaleDateString(locale, { day: "numeric" });
    return `${startDay}–${endFormatted}`;
  }

  const startFormatted = start.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: sameYear ? undefined : "numeric",
  });

  return `${startFormatted} – ${endFormatted}`;
};
