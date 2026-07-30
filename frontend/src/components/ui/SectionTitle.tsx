import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: ReactNode;
}

const SectionTitle = ({
  title,
  subtitle,
}: SectionTitleProps) => {
  return (
    <div className="mb-8">

      <h2 className="text-3xl font-bold text-gray-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-2 text-gray-500">
          {subtitle}
        </p>
      )}

    </div>
  );
};

export default SectionTitle;