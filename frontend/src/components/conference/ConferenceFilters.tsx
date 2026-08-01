import { useCategory } from "../../hooks/useCategory";

interface Props {
  categoryId?: number;
  onCategoryChange: (id?: number) => void;

  isFree?: boolean;
  onFreeChange: (value: boolean) => void;
}

const ConferenceFilter = ({
  categoryId,
  onCategoryChange,
  isFree,
  onFreeChange,
}: Props) => {
  const categories = useCategory();

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      <select
        value={categoryId ?? ""}
        onChange={(e) =>
          onCategoryChange(
            e.target.value ? Number(e.target.value) : undefined
          )
        }
        className="rounded-lg border p-3"
      >
        <option value="">All Categories</option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => onFreeChange(e.target.checked)}
        />
        Free Only
      </label>
    </div>
  );
};

export default ConferenceFilter;