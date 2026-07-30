import { conferences } from "../../data/conferences";

import ConferenceCard from "./ConferenceCard";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const UpcomingSection = () => {
  return (
    <section className="bg-gray-50 py-20">

      <Container>

        <SectionTitle
          title="Upcoming Conferences"
          subtitle="Don't miss the next exciting tech events."
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

export default UpcomingSection;