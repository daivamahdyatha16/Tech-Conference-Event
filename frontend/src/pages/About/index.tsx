import { Search, Users, GraduationCap, TrendingUp } from "lucide-react";

import AboutHero from "../../components/about/AboutHero";
import OurMission from "../../components/about/OurMission";
import HowItWorks from "../../components/about/HowItWorks";

import FeatureCards from "../../components/common/FeatureCards";
import WhyChooseTechCon from "../../components/common/WhyChooseTechCon";
import Statistics from "../../components/common/Statistics";

const offers = [
  {
    icon: Search,
    title: "Discover Conferences",
    description:
      "Browse a curated list of tech conferences, workshops, and meetups happening across Indonesia.",
  },
  {
    icon: Users,
    title: "Connect with Community",
    description:
      "Meet like-minded tech enthusiasts, developers, and professionals at every event.",
  },
  {
    icon: GraduationCap,
    title: "Learn from Experts",
    description:
      "Gain new skills and insights directly from industry leaders and experienced speakers.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Career",
    description:
      "Expand your network and knowledge to open new opportunities in the tech industry.",
  },
];

const benefits = [
  "Trusted Organizers",
  "Secure Transactions",
  "Real Community Reviews",
  "Easy Event Discovery",
  "Modern User Experience",
];

const About = () => {
  return (
    <>
      <AboutHero />
      <OurMission />

      <FeatureCards
        title="What We Offer"
        subtitle="Everything you need to explore and grow within the tech community."
        items={offers}
      />

      <HowItWorks />
      <WhyChooseTechCon benefits={benefits} />
      <Statistics />
    </>
  );
};

export default About;
