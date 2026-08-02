import {
  getConferenceTimeStatus,
  conferenceTimeStatusClasses,
} from "../../utils/conferenceStatus";

interface ConferenceStatusBadgeProps {
  startDate: string;
  endDate: string;
  className?: string;
}

const ConferenceStatusBadge = ({
  startDate,
  endDate,
  className = "",
}: ConferenceStatusBadgeProps) => {
  const status = getConferenceTimeStatus(startDate, endDate);

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${conferenceTimeStatusClasses[status]} ${className}`}
    >
      {status}
    </span>
  );
};

export default ConferenceStatusBadge;
