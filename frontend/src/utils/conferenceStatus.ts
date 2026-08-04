export type ConferenceTimeStatus = "Upcoming" | "Ongoing" | "Ended";

export const getConferenceTimeStatus = (
  startDate: string,
  endDate: string
): ConferenceTimeStatus => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "Upcoming";
  if (now <= end) return "Ongoing";
  return "Ended";
};

export const conferenceTimeStatusClasses: Record<ConferenceTimeStatus, string> = {
  Upcoming: "bg-blue-50 text-blue-700",
  Ongoing: "bg-emerald-50 text-emerald-700",
  Ended: "bg-gray-100 text-gray-500",
};
