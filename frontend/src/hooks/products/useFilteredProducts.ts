import { useQuery } from "@tanstack/react-query";
import { getFilteredProducts } from "../../actions";

export const useFilteredProducts = ({
  page,
  brands,
  categories,
  isFeatured,
}: {
  page: number;
  brands: string[];
  categories: string[];
  isFeatured?: boolean;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["filteredProducts", page, brands, categories, isFeatured],
    queryFn: () => getFilteredProducts({ page, brands, categories, isFeatured }),
    retry: false,    
    
  });
  

  return {
    data: data?.data,
    isLoading,
    totalProducts: data?.count ?? 0,
  };
};