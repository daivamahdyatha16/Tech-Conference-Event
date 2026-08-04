import type { Conference } from "../../types/conference";
import ConferenceCard from "../home/ConferenceCard";

interface ConferenceGridProps {
  conferences: Conference[];
}

const ConferenceGrid = ({
  conferences,
}: ConferenceGridProps) => {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {conferences.map((conference) => (
        <ConferenceCard
          key={conference.id}
          conference={conference}
        />
      ))}
    </div>
  );
};

export default ConferenceGrid;