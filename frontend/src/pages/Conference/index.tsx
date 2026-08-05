import { useState } from "react";
import { useLocation } from "react-router-dom";

import { useConference } from "../../hooks/useConference";
import { useDebounce } from "../../hooks/useDebounce";

import ConferenceSearch from "../../components/conference/ConferenceSearch";
import ConferenceGrid from "../../components/conference/ConferenceGrid";
import ConferencePagination from "../../components/conference/ConferencePagination";
import ConferenceFilters from "../../components/conference/ConferenceFilters";
import ConferenceEmpty from "../../components/conference/ConferenceEmpty";
import ConferenceCardSkeleton from "../../components/home/ConferenceCardSkeleton";

const Conference = () => {
  const location = useLocation();
  const [search, setSearch] = useState(
    () => (location.state as { search?: string })?.search ?? ""
  );
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number>();
  const [city, setCity] = useState<string>();
  const [isFree, setIsFree] = useState<boolean>();
  const debouncedSearch = useDebounce(search, 500);

  const { conferences, meta, loading, error } = useConference(
    page,
    debouncedSearch,
    categoryId,
    isFree,
    city,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (id?: number) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleCityChange = (value?: string) => {
    setCity(value);
    setPage(1);
  };

  const handleFreeChange = (checked: boolean) => {
    setIsFree(checked ? true : undefined);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Conferences
        </h1>
        <p className="mt-2 text-slate-500">
          Browse tech conferences and events happening across Indonesia.
        </p>
      </div>

      <ConferenceSearch value={search} onChange={handleSearchChange} />

      <ConferenceFilters
        categoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        city={city}
        onCityChange={handleCityChange}
        isFree={isFree}
        onFreeChange={handleFreeChange}
      />

      {error && (
        <p className="my-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ConferenceCardSkeleton key={index} />
          ))}
        </div>
      ) : (conferences || []).length === 0 ? (
        <ConferenceEmpty />
      ) : (
        <ConferenceGrid conferences={conferences || []} />
      )}

      {meta && (
        <ConferencePagination
          page={page}
          totalPage={meta.totalPage || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default Conference;