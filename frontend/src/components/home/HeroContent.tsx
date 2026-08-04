import CategoryPills from "./CategoryPills";
import SearchBar from "./SearchBar";
import logoIcon from "../../assets/logo/logo-icon.png";

const HeroContent = () => {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
        <img
          src={logoIcon}
          alt="TechCon Logo"
          className="h-4 w-4 object-contain"
        />
        Indonesia's Largest Tech Conference Marketplace
      </span>

      <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 lg:text-7xl">
        Discover Your
        <br />
        <span className="text-blue-600">Next Tech Conference</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
        Find conferences, workshops, hackathons, networking events and tech
        communities across Indonesia.
      </p>

      <div className="mt-8 max-w-2xl">
        <SearchBar />
      </div>

      <div className="mt-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Popular Topics
        </p>

        <CategoryPills />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-400">
        <span>Dicoding</span>
        <span>GDG</span>
        <span>AWS User Group</span>
        <span>Microsoft</span>
      </div>
    </div>
  );
};

export default HeroContent;
