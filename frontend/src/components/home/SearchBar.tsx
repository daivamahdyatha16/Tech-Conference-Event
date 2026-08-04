import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/conferences", { state: { search: keyword.trim() } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition-shadow duration-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10"
    >
      <div className="flex flex-1 items-center px-5">
        <Search size={20} className="shrink-0 text-slate-400" />

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search conferences..."
          className="w-full bg-transparent px-4 py-4 text-sm text-slate-900 placeholder-slate-400 outline-none"
        />
      </div>

      <button
        type="submit"
        className="m-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;