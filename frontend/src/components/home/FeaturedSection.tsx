import { useConference } from "../../hooks/useConference";

import ConferenceCard from "./ConferenceCard";
import ConferenceCardSkeleton from "./ConferenceCardSkeleton";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const FeaturedSection = () => {
  const { conferences, loading } = useConference(
    1,
    "",
    undefined,
    undefined,
    undefined,
    "createdAt",
    "desc",
    6
  );

  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="Featured Conferences"
          subtitle="Explore the most popular tech conferences from top organizers."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <ConferenceCardSkeleton key={index} />
              ))
            : conferences.map((conference) => (
                <ConferenceCard key={conference.id} conference={conference} />
              ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturedSection;