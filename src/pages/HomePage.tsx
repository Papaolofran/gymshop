import { FeatureGrid } from "../components/home/FeatureGrid";
import { ProductGrid } from "../components/home/ProductGrid";
import { Brands } from "../components/home/Brands";
import { prepareProducts } from "../helpers";
import { useHomeProducts } from "../hooks";
import { ProductGridSkeleton } from "../components/skeletons/ProductGridSkeleton";

export const HomePage = () => {

const { recentProducts, destacadosProducts, isLoading } = useHomeProducts();

const preparedRecentProducts = prepareProducts(recentProducts);
const preparedDestacadosProducts = prepareProducts(destacadosProducts);

    return (
        <>
            <FeatureGrid/>

            {
              isLoading ? (
                <ProductGridSkeleton numberOfProducts={4}/>
              ) : (
                <ProductGrid
                title="Nuevos productos"
                products={preparedRecentProducts}
                />
              )
            }

            {
              isLoading ? (
                <ProductGridSkeleton numberOfProducts={4}/>
              ) : (
                <ProductGrid
                title="Productos Destacados"
                products={preparedDestacadosProducts}
                />
              )
            }

            <Brands/>
        </>
    );
};