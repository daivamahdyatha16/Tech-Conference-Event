import { SearchX } from "lucide-react";

const ConferenceEmpty = () => {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <SearchX size={64} className="text-gray-400" />

      <h2 className="mt-4 text-2xl font-semibold">
        No conferences found
      </h2>

      <p className="mt-2 text-gray-500">
        Try changing your search keyword or filters.
      </p>
    </div>
  );
};

export default ConferenceEmpty;