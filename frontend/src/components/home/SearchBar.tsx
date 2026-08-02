import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="mt-8 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition-shadow duration-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10">
      <div className="flex flex-1 items-center px-5">
        <Search size={20} className="shrink-0 text-slate-400" />

        <input
          type="text"
          placeholder="Search conferences..."
          className="w-full bg-transparent px-4 py-4 text-sm text-slate-900 placeholder-slate-400 outline-none"
        />
      </div>

      <button className="m-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]">
        Search
      </button>
    </div>
  );
};

export default SearchBar;