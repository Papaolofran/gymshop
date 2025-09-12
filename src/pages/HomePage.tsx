import { FeatureGrid } from "../components/shared/home/FeatureGrid";
import { ProductGrid } from "../components/shared/home/ProductGrid";
import { Brands } from "../components/shared/home/Brands";
import { recentProducts, destacadosProducts } from "../data/initialData";
import { prepareProducts } from "../helpers";

export const HomePage = () => {

const preparedRecentProducts = prepareProducts(recentProducts);
const preparedDestacadosProducts = prepareProducts(destacadosProducts);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <FeatureGrid/>

            <ProductGrid
            title="Nuestros productos"
            products={preparedRecentProducts}
            />

            <ProductGrid
            title="Productos Destacados"
            products={preparedDestacadosProducts}
            />

            <Brands/>
        </div>
    );
};