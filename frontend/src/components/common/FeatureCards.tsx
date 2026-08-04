import type { LucideIcon } from "lucide-react";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

export interface FeatureCardItem {
  icon: LucideIcon;
  title: string;
  description?: string;
}

interface FeatureCardsProps {
  title: string;
  subtitle?: string;
  items: FeatureCardItem[];
  columns?: 3 | 4;
  tone?: "white" | "gray";
}

const columnClasses: Record<3 | 4, string> = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const FeatureCards = ({
  title,
  subtitle,
  items,
  columns = 4,
  tone = "gray",
}: FeatureCardsProps) => {
  return (
    <section className={`py-20 ${tone === "gray" ? "bg-gray-50" : ""}`}>
      <Container>
        <SectionTitle title={title} subtitle={subtitle} center />

        <div className={`grid gap-6 ${columnClasses[columns]}`}>
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <item.icon size={22} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {item.title}
              </h3>

              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeatureCards;
