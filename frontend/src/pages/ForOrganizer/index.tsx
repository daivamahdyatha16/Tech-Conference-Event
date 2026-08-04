import {
  Users,
  GraduationCap,
  Building2,
  Rocket,
  CalendarCheck,
  Code2,
  Megaphone,
  Ticket,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import OrganizerHero from "../../components/for-organizer/OrganizerHero";
import OrganizerHowItWorks from "../../components/for-organizer/OrganizerHowItWorks";

import FeatureCards from "../../components/common/FeatureCards";
import WhyChooseTechCon from "../../components/common/WhyChooseTechCon";
import Statistics from "../../components/common/Statistics";
import CallToAction from "../../components/common/CallToAction";

const whoCanOrganize = [
  { icon: Users, title: "Tech Communities" },
  { icon: GraduationCap, title: "Universities" },
  { icon: Building2, title: "Companies" },
  { icon: Rocket, title: "Startups" },
  { icon: CalendarCheck, title: "Event Organizers" },
  { icon: Code2, title: "Developer Groups" },
];

const whyOrganize = [
  {
    icon: Megaphone,
    title: "Publish Your Events",
    description:
      "Get your conference in front of thousands of engaged tech professionals.",
  },
  {
    icon: Ticket,
    title: "Sell Tickets",
    description:
      "Offer multiple ticket types and manage pricing directly on the platform.",
  },
  {
    icon: ClipboardList,
    title: "Manage Registrations",
    description:
      "Keep track of attendees and available seats in real time.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Community",
    description:
      "Build lasting relationships with attendees who share your interests.",
  },
];

const benefits = [
  "Trusted Organizers",
  "Easy Event Management",
  "Secure Transactions",
  "Modern User Experience",
  "Growing Tech Community",
];

const ForOrganizer = () => {
  return (
    <>
      <OrganizerHero />

      <FeatureCards
        title="Who Can Become an Organizer?"
        items={whoCanOrganize}
        columns={3}
        tone="white"
      />

      <FeatureCards
        title="Why Organize with TechCon"
        items={whyOrganize}
      />

      <OrganizerHowItWorks />
      <WhyChooseTechCon benefits={benefits} />
      <Statistics />

      <CallToAction
        title="Ready to Host Your First Conference?"
        buttonText="Become an Organizer"
        buttonTo="/create-conference"
      />
    </>
  );
};

export default ForOrganizer;
