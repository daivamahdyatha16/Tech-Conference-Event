import CategoryPills from "./CategoryPills";
import SearchBar from "./SearchBar";

const HeroContent = () => {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
        🚀 Indonesia's Largest Tech Conference Marketplace
      </span>

      <h1 className="mt-6 text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
        Discover Your
        <br />
        <span className="text-blue-600">Next Tech Conference</span>
      </h1>

      <p className="mt-6 text-lg leading-8 text-slate-500">
        Find conferences, workshops, hackathons, networking events and tech
        communities across Indonesia.
      </p>

      <div className="mt-8 max-w-2xl">
        <SearchBar />
      </div>

      <div className="mt-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Popular Topics
        </p>

        <CategoryPills />
      </div>

      <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
        <span>Dicoding</span>
        <span>GDG</span>
        <span>AWS User Group</span>
        <span>Microsoft</span>
      </div>
    </div>
  );
};

export default HeroContent;
