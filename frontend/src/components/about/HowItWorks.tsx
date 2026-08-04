import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const steps = [
  {
    title: "Browse Conferences",
    description: "Explore tech conferences and events happening near you.",
  },
  {
    title: "View Event Details",
    description: "Check the schedule, venue, speakers, and ticket options.",
  },
  {
    title: "Purchase Tickets",
    description: "Secure your spot with a quick and simple checkout.",
  },
  {
    title: "Attend the Event",
    description: "Show up, learn, and connect with the tech community.",
  },
  {
    title: "Share Your Experience",
    description: "Leave a review and rating to help other attendees.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="How It Works"
          subtitle="Getting started with TechCon takes just a few simple steps."
          center
        />

        <div className="relative mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-blue-200 lg:block"
          />

          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm shadow-blue-600/30">
                {index + 1}
              </div>

              <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
