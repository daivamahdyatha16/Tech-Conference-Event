import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: ReactNode;
  center?: boolean;
}

const SectionTitle = ({
  title,
  subtitle,
  center = false,
}: SectionTitleProps) => {
  return (
    <div className={`mb-14 ${center ? "mx-auto text-center" : ""}`}>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-3 text-lg leading-relaxed text-slate-500 ${
            center ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;