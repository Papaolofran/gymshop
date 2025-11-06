import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "../../actions/product";

export const useProduct = (slug: string) => {
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
      queryKey: ["product", slug],
      queryFn: () => getProductBySlug(slug),
      retry: false,
  });

  return {
    product,
    isLoading,
    isError,
  };
};