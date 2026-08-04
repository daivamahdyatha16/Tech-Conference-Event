import { useEffect, useState } from "react";
import { getCategories } from "../api/category.api";
import type { Category } from "../types/category";

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategories();
      setCategories(res.data);
    };

    fetchCategories();
  }, []);

  return categories;
};