import { prepareProducts } from "../helpers";
import { CardProduct } from "../components/products/CardProduct";
import { ContainerFilter } from "../components/products/ContainerFilter";
import { useFilteredProducts } from "../hooks";
import { useState } from "react";
import { Pagination } from "../components/shared/Pagination";
import { Loader } from "../components/shared/Loader";

export const ProductsPage = () => {

    const [page, setPage] = useState(1);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    const { data: products = [], isLoading, totalProducts } = useFilteredProducts({
        page,
        brands: selectedBrands,
        categories: selectedCategories,
    });

    const preparedProducts = isLoading ? [] : prepareProducts(products);
    
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
         <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center mb-8 sm:mb-12">
            Productos
         </h1>   

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* FILTROS */}
            <aside className="lg:col-span-1">
                <ContainerFilter
                    selectedBrands={selectedBrands}
                    setSelectedBrands={setSelectedBrands}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />
            </aside>

            {/* PRODUCTOS */}
            <main className="lg:col-span-3">
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader/>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 sm:gap-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {preparedProducts.map(product => (
                                <CardProduct
                                    key={product.id}
                                    img={product.images[0] || ''}
                                    name={product.name}
                                    price={product.price}
                                    slug={product.slug}
                                    colors={product.colors}
                                    variants={product.variants}
                                />
                            ))}
                        </div>
                        
                        <Pagination
                            totalItems={totalProducts}
                            page={page}
                            setPage={setPage}
                        />
                    </div>
                )}
            </main>
         </div>
        </div>
    );
};