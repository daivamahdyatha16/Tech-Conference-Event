import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="mt-8 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

      <div className="flex flex-1 items-center px-5">

        <Search
          size={20}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search conferences..."
          className="w-full px-4 py-4 outline-none"
        />

      </div>

      <button className="m-2 rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700">
        Search
      </button>

    </div>
  );
};

export default SearchBar;