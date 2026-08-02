import { SearchX } from "lucide-react";

import ImagePlaceholder from "../ui/ImagePlaceholder";

import emptyStateIllustration from "../../assets/images/empty-state.webp";

const ConferenceEmpty = () => {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
      <ImagePlaceholder
        src={emptyStateIllustration}
        alt="No conferences found"
        icon={SearchX}
        iconSize={32}
        fit="contain"
        width={400}
        height={400}
        className="h-32 w-32 rounded-full"
      />

      <h2 className="mt-6 text-xl font-bold text-slate-900">
        No conferences found
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        We couldn't find any conferences matching your search. Try adjusting
        your keyword or filters.
      </p>
    </div>
  );
};

export default ConferenceEmpty;
