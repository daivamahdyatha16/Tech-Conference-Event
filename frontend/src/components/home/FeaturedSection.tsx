import { conferences } from "../../data/conferences";
import ConferenceCard from "./ConferenceCard";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const FeaturedSection = () => {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="Featured Conferences"
          subtitle="Explore the most popular tech conferences from top organizers."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {conferences.map((conference) => (
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