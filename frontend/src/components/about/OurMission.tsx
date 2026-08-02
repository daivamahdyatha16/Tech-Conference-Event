import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const OurMission = () => {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle title="Our Mission" center />

        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-slate-500">
          TechCon is a marketplace built to bridge the gap between tech event
          organizers and the community they serve. We help attendees
          discover the best conferences, workshops, and meetups happening
          across Indonesia, while giving organizers a simple platform to
          publish, promote, and manage their events — from ticketing to
          audience reach. Our mission is to make it effortless for great
          tech events to find the people who want to be there.
        </p>
      </Container>
    </section>
  );
};

export default OurMission;
