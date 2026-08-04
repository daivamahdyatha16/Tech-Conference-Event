import { Link } from "react-router-dom";
import { Presentation } from "lucide-react";

import Container from "../ui/Container";
import Button from "../ui/Button";
import ImagePlaceholder from "../ui/ImagePlaceholder";

import organizerHeroImage from "../../assets/images/organizer-hero.webp";

const OrganizerHero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl"
      />

      <Container>
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            For Organizers
          </span>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 lg:text-6xl">
            Host Your Next{" "}
            <span className="text-blue-600">Tech Conference</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            Reach thousands of developers, engineers, startups, and tech
            communities across Indonesia.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/create-conference">
              <Button>Become an Organizer</Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-3xl shadow-xl shadow-slate-900/10">
          <ImagePlaceholder
            src={organizerHeroImage}
            alt="Organizer presenting at a TechCon conference"
            icon={Presentation}
            iconSize={48}
            width={1600}
            height={900}
            className="h-64 w-full sm:h-80 lg:h-[420px]"
          />
        </div>
      </Container>
    </section>
  );
};

export default OrganizerHero;
