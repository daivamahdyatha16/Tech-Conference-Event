import { useConference } from "../../hooks/useConference";

import ConferenceCard from "./ConferenceCard";
import ConferenceCardSkeleton from "./ConferenceCardSkeleton";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const UpcomingSection = () => {
  const { conferences, loading } = useConference();

  return (
    <section className="bg-gray-50 py-20">
      <Container>
        <SectionTitle
          title="Upcoming Conferences"
          subtitle="Don't miss the next exciting tech events."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <ConferenceCardSkeleton key={index} />
              ))
            : (conferences || [])
                .slice(0, 3)
                .map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
        </div>
      </Container>
    </section>
  );
};

export default UpcomingSection;