import type { Color, Product, VariantProduct } from "../interfaces";

// Export helper para obtener token de autenticación
export { getAuthToken } from './getAuthToken';

// Funcion para formatear el precio a pesos argentinos
export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

// Funcion para preparar los productos - (PRODUCTOS)
export const prepareProducts = (products: Product[]) => {
    return products.map(product => {
        // Agrupar las variantes por color
        const colors = product.variants.reduce((acc: Color[], variant: VariantProduct) => {
          // Filtrar variantes sin color definido
          if (!variant.color || !variant.color_name) {
            return acc;
          }

          const existingColor = acc.find(item => item.color === variant.color)

          if (existingColor) {
            // Si ya existe el color, comparamos los precios
            existingColor.price = Math.min(existingColor.price, variant.price)
          }  //Mantenemos el precio mínimo
          else {
            acc.push({
              color: variant.color,
              price: variant.price,
              name: variant.color_name,
            });
          }
          return acc;
        }, []);

        // Si no hay colores válidos, crear uno por defecto
        const finalColors = colors.length > 0 ? colors : [{
          color: '#000000',
          price: product.variants[0]?.price || 0,
          name: 'Predeterminado'
        }];

        // Obtener el precio mas bajo de las variantes agrupadas
        const price = Math.min(...finalColors.map(item => item.price));

        // Devolver el producto formateado
        return {
          ...product,
          price,
          colors: finalColors.map((colorItem) => ({
            name: colorItem.name,
            color: colorItem.color
          })),
          variants: product.variants,
        };
    });
};