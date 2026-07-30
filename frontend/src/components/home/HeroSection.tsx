import Container from "../ui/Container";
import HeroContent from "./HeroContent";

import HeroConference from "../../assets/images/hero-conference.png";

const HeroSection = () => {
  return (
    <section className="bg-slate-50 py-20">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <HeroContent />

          <div className="flex justify-center">
            <div className="relative overflow-hidden rounded-[32px] ">
              <img
                src={HeroConference}
                alt="Tech Conference"
                className="h-[420px] w-[560px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8">
                <span className="rounded-full bg-blue-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  Tech Community
                </span>

                <h2 className="mt-4 text-3xl font-bold text-white">
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