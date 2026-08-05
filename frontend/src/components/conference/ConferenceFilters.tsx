import { useCategory } from "../../hooks/useCategory";
import { useCities } from "../../hooks/useCities";

interface Props {
  categoryId?: number;
  onCategoryChange: (id?: number) => void;

  city?: string;
  onCityChange: (city?: string) => void;

  isFree?: boolean;
  onFreeChange: (value: boolean) => void;
}

const ConferenceFilter = ({
  categoryId,
  onCategoryChange,
  city,
  onCityChange,
  isFree,
  onFreeChange,
}: Props) => {
  const categories = useCategory();
  const cities = useCities();

  const selectClass =
    "cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <select
        value={categoryId ?? ""}
        onChange={(e) =>
          onCategoryChange(
            e.target.value ? Number(e.target.value) : undefined
          )
        }
        className={selectClass}
      >
        <option value="">All Categories</option>

        {(categories || []).map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={city ?? ""}
        onChange={(e) => onCityChange(e.target.value || undefined)}
        className={selectClass}
      >
        <option value="">All Cities</option>

        {(cities || []).map((cityOption) => (
          <option key={cityOption} value={cityOption}>
            {cityOption}
          </option>
        ))}
      </select>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-gray-300">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => onFreeChange(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
        />
        Free Only
      </label>
    </div>
  );
};

export default ConferenceFilter;