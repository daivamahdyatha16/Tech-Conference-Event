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
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      <h2 className="text-4xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3 max-w-2xl text-lg text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;