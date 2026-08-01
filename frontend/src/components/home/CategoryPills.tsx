import { useCategory } from "../../hooks/useCategory";

const CategoryPills = () => {
  const categories = useCategory();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          className="rounded-full border border-gray-300 px-5 py-2 text-sm transition-all duration-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;