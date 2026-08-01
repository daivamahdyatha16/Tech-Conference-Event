import { useState } from "react";

import { useConference } from "../../hooks/useConference";
import { useDebounce } from "../../hooks/useDebounce";

import ConferenceSearch from "../../components/conference/ConferenceSearch";
import ConferenceGrid from "../../components/conference/ConferenceGrid";
import ConferencePagination from "../../components/conference/ConferencePagination";
import ConferenceFilters from "../../components/conference/ConferenceFilters";
import ConferenceEmpty from "../../components/conference/ConferenceEmpty";

const Conference = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number>();
  const [isFree, setIsFree] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const { conferences, meta, loading, error } = useConference(
    page,
    debouncedSearch,
    categoryId,
    isFree,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold">Conferences</h1>

      <ConferenceSearch value={search} onChange={setSearch} />

      <ConferenceFilters
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        isFree={isFree}
        onFreeChange={setIsFree}
      />

      {error && <p className="my-6 text-red-500">{error}</p>}

      {loading ? (
        <p className="py-20 text-center">Loading...</p>
      ) : conferences.length === 0 ? (
        <ConferenceEmpty />
      ) : (
        <ConferenceGrid conferences={conferences} />
      )}

      <ConferencePagination
        page={page}
        totalPage={meta.totalPage}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Conference;
