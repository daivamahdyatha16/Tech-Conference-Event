import { CheckCircle2 } from "lucide-react";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

interface WhyChooseTechConProps {
  benefits: string[];
}

const WhyChooseTechCon = ({ benefits }: WhyChooseTechConProps) => {
  return (
    <section className="bg-gray-50 py-20">
      <Container>
        <SectionTitle title="Why Choose TechCon" center />

        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div
              key={benefit}
              className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5 ${
                index === benefits.length - 1 && benefits.length % 2 !== 0
                  ? "sm:col-span-2"
                  : ""
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
              <span className="font-medium text-slate-800">{benefit}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WhyChooseTechCon;
