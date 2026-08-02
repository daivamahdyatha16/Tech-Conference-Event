import { Link } from "react-router-dom";

import Container from "../ui/Container";
import Button from "../ui/Button";

interface CallToActionProps {
  title: string;
  buttonText: string;
  buttonTo: string;
}

const CallToAction = ({ title, buttonText, buttonTo }: CallToActionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
      />

      <Container>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            {title}
          </h2>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={buttonTo}>
              <Button variant="secondary">{buttonText}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CallToAction;
