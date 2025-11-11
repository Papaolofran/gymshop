import { useQuery } from "@tanstack/react-query";
import { getFilteredProducts } from "../../actions";

export const useFilteredProducts = ({
  page,
  brands,
  categories,
}: {
  page: number;
  brands: string[];
  categories: string[];
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["filteredProducts", page, brands, categories],
    queryFn: () => getFilteredProducts({ page, brands, categories }),
    retry: false,    
    
  });
  

  return {
    data: data?.data,
    isLoading,
    totalProducts: data?.count ?? 0,
  };
};