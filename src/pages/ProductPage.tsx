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

  const { product, isLoading, isError } = useProduct(slug || "");

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

  // Detectar tipo de producto
  const isClothing = product?.categories?.name?.toLowerCase() === 'ropa';
  const isSupplement = product?.categories?.name?.toLowerCase() === 'suplementos';

  // Agrupamos las variantes por color (para ropa)
  const colors = useMemo(() => {
    if (!isClothing) return {};
    return product?.variants.reduce(
      (acc: ClothingAcc, variant: VariantProduct) => {
        const { color, color_name, size } = variant;
        
        // Skip if color, color_name, or size is null
        if (!color || !color_name || !size) return acc;
        
        if(!acc[color]) {
            acc[color] = {
              name: color_name,
              sizes: [],
            };
        }

        if (!acc[color].sizes.includes(size)) {
          acc[color].sizes.push(size);
        }

        return acc;
      },
      {} as ClothingAcc
    ) || {};
  }, [product?.variants, isClothing]);

  // Agrupamos las variantes por peso (para suplementos)
  const weights = useMemo(() => {
    if (!isSupplement) return {};
    return product?.variants.reduce(
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
  }, [product?.variants, isSupplement]);

  // Obtener el primer color o peso predeterminado
  const availableColors = Object.keys(colors);
  const availableWeights = Object.keys(weights);

  useEffect(() => {
    if (isClothing && !selectedColor && availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
    }
    if (isSupplement && !selectedWeight && availableWeights.length > 0) {
      setSelectedWeight(availableWeights[0]);
    }
  }, [availableColors, availableWeights, selectedColor, selectedWeight, isClothing, isSupplement]);

  // Actualizar la talla seleccionada cuando se selecciona un color (ropa)
  useEffect(() => {
    if (isClothing && selectedColor && colors[selectedColor]) {
     setSelectedSize(colors[selectedColor].sizes[0]);
    }
  }, [selectedColor, colors, isClothing]);

  // Actualizar el sabor seleccionado cuando se selecciona un peso (suplementos)
  useEffect(() => {
    if (isSupplement && selectedWeight && weights[selectedWeight]) {
     setSelectedFlavor(weights[selectedWeight][0]);
    }
  }, [selectedWeight, weights, isSupplement]);

  // Obtener la variante seleccionada
  useEffect(() => {
    if(isClothing && selectedColor && selectedSize) {
      const variant = product?.variants.find(
        variant => variant.color === selectedColor && variant.size === selectedSize
      );
      setSelectedVariant(variant as VariantProduct);
    }
    
    if(isSupplement && selectedWeight && selectedFlavor) {
      const variant = product?.variants.find(
        variant => variant.weight === selectedWeight && variant.flavor === selectedFlavor
      );
      setSelectedVariant(variant as VariantProduct);
    }
  }, [selectedColor, selectedSize, selectedWeight, selectedFlavor, product?.variants, isClothing, isSupplement]);

  // Obtener el stock
  const isOutOfStock = selectedVariant?.stock === 0;

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
            {formatPrice(selectedVariant?.price || product.variants[0].price)}
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
            <div className="flex flex-col gap-3">
              <p>
                Color: {selectedColor && colors[selectedColor].name}
              </p>
              <div className="flex gap-3">
                {
                  availableColors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full flex justify-center items-center ${ selectedColor === color ? "border border-slate-800" : ""
                    }`}>
                      <span className="w-[26px] h-[26px] rounded-full"
                      style={{backgroundColor: color}}
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Talla
              </p>

              {
                selectedColor && (
                  <div className="flex gap-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-1"
                            value={selectedSize || ""}
                            onChange={(e) => setSelectedSize(e.target.value)}
                    >
                      {
                        colors[selectedColor].sizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))
                      }
                     </select>
                   </div>
                )}
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
                  Cantidad:
                </p>

                <div className="flex gap-8 px-5 py-3 border border-slate-200 w-fit rounded-full">
                  <button>
                      <LuMinus size={15}/>
                  </button>
                  <span className="text-slate-500 text-sm">1</span>
                  <button>
                      <LuPlus size={15}/>
                  </button>
                </div>
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="flex flex-col gap-3">
                <button className="bg-[#f3f3f3] uppercase font-semibold tracking-widest text-xs py-4 rounded-full transition-all duration-300 hover:bg-[#e2e2e2]">
                  Agregar al carro
                </button>
                <button className="bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full">
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
