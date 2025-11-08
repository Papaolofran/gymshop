import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VariantProduct } from "../../interfaces";
import { formatPrice } from "../../helpers";
import { Tag } from "../shared/Tag";
import { HiPhoto } from "react-icons/hi2";
import toast from 'react-hot-toast';

interface Props {
    img: string;
    name: string;
    price: number;
    slug: string;
    colors: {name: string; color: string}[];
    variants: VariantProduct[];
}

export const CardProduct = ({img, name, price, slug, colors, variants}: Props) => {
    const navigate = useNavigate();

    const [activeColor, setActiveColor] = useState<{
      name: string;
      color: string
    }>(colors[0]);

    // Indentificar la variante seleccionada según el color activo
    const selectedVariant = variants.find(
      variant => variant.color === activeColor.color
    );

    const stock = selectedVariant?.stock || 0;

    // Manejar click en producto
    const handleProductClick = (e: React.MouseEvent) => {
      if (stock === 0) {
        e.preventDefault();
        toast.error(`${name} está agotado`, {
          icon: '❌',
          duration: 3000,
        });
        return;
      }

      if (stock > 0 && stock <= 5) {
        toast(`¡Solo quedan ${stock} unidades!`, {
          icon: '⚠️',
          duration: 2500,
        });
      }

      // Navegar al producto
      navigate(`/productos/${slug}`);
    };

    return (
      <div className="flex flex-col gap-6 relative">
        <div 
          onClick={handleProductClick}
          className={`flex relative group overflow-hidden rounded-lg bg-gray-100 ${
            stock === 0 ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
          }`}
        >
          <div className="flex w-full aspect-square items-center justify-center p-4 overflow-hidden">
            {img ? (
              <img 
                src={img} 
                alt={name} 
                className="object-contain w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <HiPhoto size={80} className="transition-transform duration-300 ease-in-out group-hover:scale-110" />
                <p className="text-sm mt-2">Sin imagen</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center">
          <p className="text-[15px] font-medium">{name}</p>
          <p className="text-[15px] font-medium">{formatPrice(price)}</p>

          <div className="flex gap-3 mt-3">
            {colors.map((color) => (
              <button 
                key={color.color}
                onClick={(e) => {
                  e.stopPropagation(); // Prevenir navegación al producto
                  setActiveColor(color);
                }}
                className={`p-0.5 rounded-full cursor-pointer transition-all ${
                  activeColor.color === color.color 
                    ? 'ring-2 ring-black' 
                    : 'hover:scale-110'
                }`}
                title={color.name}
              >
                <span 
                  className={`block w-4 h-4 rounded-full transition-all ${
                    activeColor.color === color.color
                      ? 'border-2 border-gray-800'
                      : 'border border-gray-400'
                  }`}
                  style={{backgroundColor: color.color}}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-2 left-2">
          {stock === 0 && <Tag contentTag="Agotado"/>}
        </div>
      </div>
    );
};