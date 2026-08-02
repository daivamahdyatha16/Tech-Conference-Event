import { ChevronDown } from "lucide-react";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

const steps = [
  {
    title: "Create Your Conference",
    description: "Fill in your event details — name, date, time, and venue.",
  },
  {
    title: "Add Ticket Types",
    description: "Set up ticket categories, pricing, and available quota.",
  },
  {
    title: "Publish Your Event",
    description: "Make your conference visible to thousands of attendees.",
  },
  {
    title: "Receive Registrations",
    description: "Track ticket sales as attendees register for your event.",
  },
];

const OrganizerHowItWorks = () => {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          title="How It Works"
          subtitle="From idea to a fully published conference in four simple steps."
          center
        />

        <div className="mx-auto flex max-w-md flex-col items-center">
          {steps.map((step, index) => (
            <div key={step.title} className="w-full">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white shadow-sm shadow-blue-600/30">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <ChevronDown className="text-blue-300" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default OrganizerHowItWorks;
