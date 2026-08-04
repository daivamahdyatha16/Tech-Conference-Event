import { Search } from "lucide-react";

interface ConferenceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ConferenceSearch = ({ value, onChange }: ConferenceSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Search conferences..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

export default ConferenceSearch;
