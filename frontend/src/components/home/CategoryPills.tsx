import { useCategory } from "../../hooks/useCategory";

const CategoryPills = () => {
  const categories = useCategory();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-600/20 active:translate-y-0"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;