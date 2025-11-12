import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "../../actions/product";

export const useProduct = (slug: string, refreshKey?: string) => {
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
      // Agregar refreshKey a la queryKey para forzar recarga cuando sea necesario
      queryKey: ["product", slug, refreshKey],
      queryFn: () => getProductBySlug(slug),
      retry: false,
      staleTime: 1000, // Considerar datos obsoletos rápidamente
      gcTime: 5000, // Tiempo antes de recolectar la memoria (antes se llamaba cacheTime)
  });

  return {
    product,
    isLoading,
    isError,
  };
};