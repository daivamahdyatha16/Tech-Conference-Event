import Container from "../ui/Container";
import HeroContent from "./HeroContent";

import HeroConference from "../../assets/images/hero-conference.webp";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"
      />

      <Container>
        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          <HeroContent />

          <div className="flex justify-center">
            <div className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
              <img
                src={HeroConference}
                alt="Tech Conference"
                width={1958}
                height={1536}
                loading="lazy"
                decoding="async"
                className="h-[420px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8">
                <span className="rounded-full bg-blue-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  Tech Community
                </span>

                <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
                  Connect.
                  <br />
                  Learn.
                  <br />
                  Grow.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;