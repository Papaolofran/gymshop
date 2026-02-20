import { FeatureGrid } from "../components/home/FeatureGrid";
import { ProductGrid } from "../components/home/ProductGrid";
import { Brands } from "../components/home/Brands";
import { prepareProducts } from "../helpers";
import { useHomeProducts } from "../hooks";
import { ProductGridSkeleton } from "../components/skeletons/ProductGridSkeleton";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

export const HomePage = () => {
    const { recentProducts, destacadosProducts, isLoading } = useHomeProducts();
    const location = useLocation();
    
    // Detectar si venimos de una eliminación de cuenta
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const isAccountDeleted = urlParams.get('deleted') === 'true';
        
        if (isAccountDeleted) {
            // Asegurarse de que la sesión esté cerrada
            const checkSession = async () => {
                // Verificar si hay sesión activa
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    // Si todavía hay sesión, cerrarla
                    await supabase.auth.signOut();
                    toast.success('Tu cuenta ha sido eliminada y tu sesión cerrada correctamente', {
                        duration: 5000,
                    });
                    // Limpiar URL
                    window.history.replaceState({}, '', '/');
                }
            };
            
            checkSession();
        }
    }, [location.search]);
    
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