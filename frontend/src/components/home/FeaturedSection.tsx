import { useConference } from "../../hooks/useConference";

import ConferenceCard from "./ConferenceCard";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const FeaturedSection = () => {
  const { conferences, loading } = useConference();

  if (loading) return null;

  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="Featured Conferences"
          subtitle="Explore the most popular tech conferences from top organizers."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {conferences.slice(0, 3).map((conference) => (
            <ConferenceCard
              key={conference.id}
              conference={conference}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturedSection;