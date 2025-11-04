import { FeatureGrid } from "../components/shared/home/FeatureGrid";
import { ProductGrid } from "../components/shared/home/ProductGrid";
import { Brands } from "../components/shared/home/Brands";
import { prepareProducts } from "../helpers";
import { useHomeProducts } from "../hooks";
import { ProductGridSkeleton } from "../components/skeletons/ProductGridSkeleton";

export const HomePage = () => {

const { recentProducts, destacadosProducts, isLoading } = useHomeProducts();

const preparedRecentProducts = prepareProducts(recentProducts);
const preparedDestacadosProducts = prepareProducts(destacadosProducts);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
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
        </div>
    );
};