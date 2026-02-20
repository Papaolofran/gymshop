import { useQueries } from "@tanstack/react-query";
import { getDestacadosProducts, getRecentProducts } from "../../actions";

export const useHomeProducts = () => {
 const results = useQueries({
   queries:  [
    {
      queryKey: ["recentProducts"],
      queryFn: getRecentProducts,
    },
    {
      queryKey: ["destacadosProducts"],
      queryFn: getDestacadosProducts,
    }
   ]
 });   

 const [recentProductsResult, destacadosProductsResult] = results; // [resultadoQuery1, resultadoQuery2]

 // Combinar los estados de las consultas
 const isLoading = recentProductsResult.isLoading || destacadosProductsResult.isLoading;
 const isError = recentProductsResult.isError || destacadosProductsResult.isError;

 return {
    isLoading,
    isError,
    recentProducts: recentProductsResult.data || [],
    destacadosProducts: destacadosProductsResult.data || [],
 };
};