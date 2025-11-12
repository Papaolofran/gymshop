import { LuMinus, LuPlus } from "react-icons/lu"
import { Separator } from "../components/shared/Separator"
import { formatPrice } from "../helpers"
import { CiDeliveryTruck } from "react-icons/ci"
import { Link, useParams } from "react-router-dom"
import { BsChatLeftText } from "react-icons/bs"
import { GridImages } from "../components/one-product/GridImages"
import { useProduct } from "../hooks/products/useProduct";
import { useMemo, useEffect, useState } from "react";
import type { VariantProduct } from "../interfaces";
import { Tag } from "../components/shared/Tag"
import { Loader } from "../components/shared/Loader"
import { useCounterStore } from "../store/counter.store";
import { useCartStore } from "../store/cart.store";
import { useGlobalStore } from "../store/global.store";
import type { ICartItem } from "../components/shared/CartItem";

// Para ropa (color + talla)
interface ClothingAcc {
  [key: string]: {
    name: string;
    sizes: string[];
  };
}

// Para suplementos (peso + sabor)
interface SupplementAcc {
  [key: string]: string[]; // weight -> [flavors]
}

export const ProductPage = () => {

  const { slug } = useParams<{ slug: string }>();
  
  // Usar una clave única para forzar recarga de datos
  const refreshKey = useMemo(() => Date.now().toString(), []);

  const { product, isLoading, isError } = useProduct(slug || "", refreshKey);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    null
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(
    null
  );

  const [selectedWeight, setSelectedWeight] = useState<string | null>(
    null
  );

  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(
    null
  );

  const [selectedVariant, setSelectedVariant] = useState<VariantProduct | null>(
    null
  );

  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  const decrement = useCounterStore(state => state.decrement);
  const resetCount = useCounterStore(state => state.reset);
  
  const addItem = useCartStore(state => state.addItem);
  const openSheet = useGlobalStore(state => state.openSheet);

  // Detectar tipo de producto
  const isClothing = product?.categories?.name?.toLowerCase() === 'ropa';
  const isSupplement = product?.categories?.name?.toLowerCase() === 'suplementos';
  
  // Verificar si el producto tiene variantes válidas
  const hasValidVariants = product?.variants && product.variants.length > 0;

  // Agrupamos las variantes por color y tamaño (para ropa)
  const colors = useMemo(() => {
    if (!isClothing || !hasValidVariants) return {};
    
    console.log('Agrupando variantes por color y talla...');
    
    // NO filtrar para incluir todas las variantes posibles
    const allVariants = product.variants;
    
    // Solo para debug: Imprimir todos los colores/tallas disponibles 
    const allColors = new Set(allVariants.map(v => v.color).filter(Boolean));
    const allSizes = new Set(allVariants.map(v => v.size).filter(Boolean));
    console.log(`Producto tiene ${allColors.size} colores y ${allSizes.size} tallas`);
    
    // Agrupar por color
    const result = allVariants.reduce(
      (acc: ClothingAcc, variant: VariantProduct) => {
        const { color, color_name, size } = variant;
        
        // Skip si faltan datos esenciales
        if (!color || !color_name || !size) {
          console.warn('Variante con datos incompletos:', variant);
          return acc;
        }
        
        // Crear entrada para este color si no existe
        if(!acc[color]) {
          acc[color] = {
            name: color_name,
            sizes: [],
          };
        }

        // Agregar la talla si no está incluida
        if (!acc[color].sizes.includes(size)) {
          acc[color].sizes.push(size);
          console.log(`Agregando talla ${size} al color ${color_name}`);
        }

        return acc;
      },
      {} as ClothingAcc
    ) || {};
    
    console.log('Agrupación final de colores y tallas:', result);
    return result;
  }, [product?.variants, isClothing, hasValidVariants]);

  // Agrupamos las variantes por peso (para suplementos)
  const weights = useMemo(() => {
    if (!isSupplement || !hasValidVariants) return {};
    
    // Filtrar solo variantes con propiedades completas, sin filtrar por stock
    const validVariants = product.variants.filter(variant => 
      variant && variant.weight && variant.flavor
    );
    
    return validVariants.reduce(
      (acc: SupplementAcc, variant: VariantProduct) => {
        const { weight, flavor } = variant;
        
        // Skip if weight or flavor is null
        if (!weight || !flavor) return acc;
        
        if(!acc[weight]) {
            acc[weight] = [];
        }

        if (!acc[weight].includes(flavor)) {
          acc[weight].push(flavor);
        }

        return acc;
      },
      {} as SupplementAcc
    ) || {};
  }, [product?.variants, isSupplement, hasValidVariants]);

  // Obtener todas las tallas únicas disponibles en el producto
  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(
      product.variants
        .filter(v => v.size) // Filtrar variantes con talla definida
        .map(v => v.size as string)    // Extraer las tallas y asegurar tipo string
    )].sort();
  }, [product?.variants]);

  // Obtener colores disponibles para la talla seleccionada
  const availableColorsForSelectedSize = useMemo(() => {
    if (!isClothing || !product?.variants || !selectedSize) return [];
    
    // Filtrar las variantes que coinciden con la talla seleccionada
    const variantsForSize = product.variants.filter(v => v.size === selectedSize);
    
    // Extraer los colores únicos de estas variantes
    const colorsForSize = variantsForSize
      .filter(v => v.color && v.color_name) // Solo incluir si tienen color definido
      .map(v => ({
        color: v.color as string,
        name: v.color_name as string
      }));
    
    // Eliminar duplicados
    const uniqueColors = colorsForSize.filter((color, index, self) => 
      index === self.findIndex(c => c.color === color.color)
    );
    
    // Eliminamos console.log para evitar mensajes de depuración
    return uniqueColors;
  }, [isClothing, product?.variants, selectedSize]);

  // Listas genéricas para la interfaz
  // Solo necesitamos availableWeights para los suplementos
  const availableWeights = Object.keys(weights);

  // Inicializar la primera talla en lugar del primer color
  useEffect(() => {
    if (isClothing && !selectedSize && allSizes.length > 0) {
      setSelectedSize(allSizes[0]);
    }
    if (isSupplement && !selectedWeight && availableWeights.length > 0) {
      setSelectedWeight(availableWeights[0]);
    }
  }, [allSizes, availableWeights, selectedSize, selectedWeight, isClothing, isSupplement]);
  
  // Actualizar el color cuando se cambia la talla (nuevo comportamiento)
  // Necesitamos hacer referencia a selectedColor pero no incluirlo como dependencia
  // para evitar bucles infinitos, por eso usamos el eslint-disable
  useEffect(() => {
    // Solo actuamos si hay talla seleccionada y colores disponibles para esa talla
    if (isClothing && selectedSize && availableColorsForSelectedSize.length > 0) {
      // Casos en los que necesitamos actualizar el color:
      // 1. No hay color seleccionado
      // 2. El color actual no está disponible para la talla seleccionada
      const needsUpdate = !selectedColor || !availableColorsForSelectedSize.some(
        colorObj => colorObj.color === selectedColor
      );
      
      if (needsUpdate) {
        const newColor = availableColorsForSelectedSize[0].color;
        // Eliminamos console.log para evitar mensajes en consola
        setSelectedColor(newColor);
      }
    }
    // Intencionalmente omitimos selectedColor de las dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, availableColorsForSelectedSize, isClothing]);

  // Ya no necesitamos actualizar la talla basada en el color, pues ahora el flujo es talla -> color
  // Eliminamos este efecto para evitar el bucle infinito

  // Actualizar el sabor seleccionado cuando se selecciona un peso (suplementos)
  useEffect(() => {
    if (isSupplement && selectedWeight && weights[selectedWeight]) {
     setSelectedFlavor(weights[selectedWeight][0]);
    }
  }, [selectedWeight, weights, isSupplement]);

  // Debug info - Logging detailed info about variants and colors on initial load
  useEffect(() => {
    if (product?.variants) {
      // Print general info about the product
      console.log("Product loaded:", {
        name: product.name,
        category: product.categories?.name,
        variant_count: product.variants.length
      });
      
      // Group variants by size for debugging
      const variantsBySize: Record<string, VariantProduct[]> = {};
      product.variants.forEach(v => {
        if (!v.size) return;
        if (!variantsBySize[v.size]) variantsBySize[v.size] = [];
        variantsBySize[v.size].push(v);
      });
      
      // Log variants grouped by size
      console.log("Variants by size:", variantsBySize);
      
      // Print color information for each size
      Object.entries(variantsBySize).forEach(([size, variants]) => {
        const sizeVariants = variants as VariantProduct[];
        const colors = sizeVariants.map(v => ({ 
          id: v.id,
          color: v.color, 
          name: v.color_name,
          stock: v.stock 
        }));
        console.log(`Colors for ${size} size (${colors.length}):`, colors);
      });
      
      // Check for variants with missing color information
      const incompleteVariants = product.variants.filter(
        v => v.size && (!v.color || !v.color_name)
      );
      if (incompleteVariants.length > 0) {
        console.warn("Found variants with incomplete color data:", incompleteVariants);
      }
    }
  }, [product]);

  // Obtener la variante seleccionada y manejar combinaciones no disponibles
  useEffect(() => {
    if(isClothing && selectedColor && selectedSize) {
      // Buscar la variante específica
      const variant = product?.variants.find(
        variant => variant.color === selectedColor && variant.size === selectedSize
      );
      
      if (variant) {
        // Si existe la combinación, seleccionarla
        setSelectedVariant(variant as VariantProduct);
        // Eliminamos console.log para evitar parpadeo
      } else {
        // Si no existe la combinación, notificar al usuario
        setSelectedVariant(null);
        // Eliminamos console.log para evitar parpadeo
      }
    }
    
    if(isSupplement && selectedWeight && selectedFlavor) {
      const variant = product?.variants.find(
        variant => variant.weight === selectedWeight && variant.flavor === selectedFlavor
      );
      setSelectedVariant(variant as VariantProduct);
    }
  }, [selectedColor, selectedSize, selectedWeight, selectedFlavor, product?.variants, isClothing, isSupplement, colors]);
  
  // Ya no necesitamos este efecto que generaba advertencias en consola

  // Obtener el stock
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  
  // Función para agregar al carrito
  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;
    
    const cartItem: ICartItem = {
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      categoryName: product.categories?.name || '',
      // Para ropa
      color: selectedVariant.color || undefined,
      colorName: selectedVariant.color_name || undefined,
      size: selectedVariant.size || undefined,
      // Para suplementos
      weight: selectedVariant.weight || undefined,
      flavor: selectedVariant.flavor || undefined,
      price: selectedVariant.price,
      quantity: count,
      image: product.images[0] || '',
      stock: selectedVariant.stock,
    };
    
    addItem(cartItem);
    resetCount();
    openSheet('cart');
  };
  
  // Función para comprar ahora
  const handleBuyNow = () => {
    handleAddToCart();
    // Aquí podrías redirigir directamente al checkout si lo deseas
  };

  if(isLoading) return <Loader/>


  if (!product || isError) return
  (
    <div className="flex justify-center items-center h-[80vh]">
      <p>Producto no encontrado</p>
    </div>
  );

  return (
    <>
    <div className="h-fit flex flex-col md:flex-row gap-16 mt-8">
      {/* GALERÍA DE IMAGENES*/}
      <GridImages images={product?.images}/>
      
      <div className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold tracking-tighter">
          {product.name}
        </h1>

        <div className="flex gap-5 items-center">
          <span className="tracking-wide text-lg font-semibold">
            {hasValidVariants
              ? formatPrice(selectedVariant?.price || (product.variants[0]?.price || 0))
              : "Precio no disponible"}
          </span>

          <div className="relative">
            {/* TAG -> AGOTADO */}
            {isOutOfStock && <Tag contentTag="Agotado"/>}
          </div>
        </div>

        <Separator />

        {/*Características*/}
        <ul className="space-y-2 ml-7 my-10">
          {
            product.features.map((feature) => (
              <li
                key={feature}
                className="text-sm flex items-center gap-2 tracking-tight font-medium">
                <span className="bg-black w-[5px] h-[5px] rounded-full"/>
                {feature}
              </li>
            ))
          }
        </ul>
        
        {/* OPCIONES PARA ROPA: Color + Talla */}
        {isClothing && (
          <>
            {/* INVERTIMOS EL ORDEN: PRIMERO TALLA, LUEGO COLOR */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Talla
              </p>
              
              {/* Selector de talla */}
              <div className="flex gap-3">
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-1"
                  value={selectedSize || ""}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">Selecciona una talla</option>
                  {allSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Color: {selectedColor ? (
                  <span className="font-normal">
                    {availableColorsForSelectedSize.find(c => c.color === selectedColor)?.name || ''}
                  </span>
                ) : ''}
              </p>
              
              {selectedSize ? (
                <div className="flex flex-wrap gap-3">
                  {availableColorsForSelectedSize.length > 0 ? (
                    availableColorsForSelectedSize.map(colorObj => (
                      <div key={colorObj.color} className="flex items-center">
                        <button 
                          onClick={() => setSelectedColor(colorObj.color)}
                          className={`w-8 h-8 rounded-full flex justify-center items-center ${
                            selectedColor === colorObj.color ? "ring-2 ring-offset-1 ring-black" : "border border-gray-300"
                          }`}
                          title={colorObj.name}
                        >
                          <span 
                            className="w-6 h-6 rounded-full" 
                            style={{backgroundColor: colorObj.color}}
                          />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay colores disponibles para esta talla</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Selecciona una talla para ver los colores disponibles</p>
              )}
              
              {/* Ya no mostramos advertencia visual porque nuestro sistema de selección evita combinaciones inválidas */}
            </div>

          </>
        )}

        {/* OPCIONES PARA SUPLEMENTOS: Peso + Sabor */}
        {isSupplement && (
          <>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Peso
              </p>

              <div className="flex gap-3">
                <select className="border border-gray-300 rounded-lg px-3 py-1"
                        value={selectedWeight || ""}
                        onChange={(e) => setSelectedWeight(e.target.value)}
                >
                  {
                    availableWeights.map(weight => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))
                  }
                 </select>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Sabor
              </p>

              {
                selectedWeight && (
                  <div className="flex gap-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-1"
                            value={selectedFlavor || ""}
                            onChange={(e) => setSelectedFlavor(e.target.value)}
                    >
                      {
                        weights[selectedWeight].map(flavor => (
                          <option key={flavor} value={flavor}>{flavor}</option>
                        ))
                      }
                     </select>
                   </div>
                )}
            </div>
          </>
        )}
        
        {/* COMPRAR */}
        {
          isOutOfStock ? (
            <button className="bg-[#f3f3f3] uppercase font-semibold tracking-widest text-xs py-4 rounded-full transition-all duration-300 hover:bg-[#e2e2e2] w-full"
            disabled>
              Agotado
            </button>
          ) : (
            <>
              {/* Contador */}
              <div className="space-y">
                <p className="text-sm font-medium">
                  Cantidad: {selectedVariant && (
                    <span className="text-xs text-gray-500">
                      (Stock: {selectedVariant.stock})
                    </span>
                  )}
                </p>

                <div className="flex gap-8 px-5 py-3 border border-slate-200 w-fit rounded-full">
                  <button 
                    onClick={decrement}
                    disabled={count === 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <LuMinus size={15}/>
                  </button>
                  <span className="text-slate-500 text-sm">{count}</span>
                  <button 
                    onClick={increment}
                    disabled={!selectedVariant || count >= selectedVariant.stock}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <LuPlus size={15}/>
                  </button>
                </div>
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="bg-[#f3f3f3] uppercase font-semibold tracking-widest text-xs py-4 rounded-full transition-all duration-300 hover:bg-[#e2e2e2] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar al carro
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comprar ahora
                </button>
              </div>
            </>
          )
        }

        <div className="flex pt-2">
          <div className="flex flex-col gap-1-flex-1 item">
            <CiDeliveryTruck size={35}/>
            <p className="text-xs font-semibold">
              Envío gratis
            </p>  
          </div>

          <Link to="#" className="flex flex-col gap-1 flex-1 items-center justify-center">
            <BsChatLeftText size={30}/>
            <p className="flex flex-col items-center text-xs">
              <span className="font-semibold">
                ¿Necesitas ayuda?
              </span>
              Contáctanos aquí
            </p>  
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};
