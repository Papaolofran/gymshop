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

export const CardProduct = ({img, name, price, slug, variants}: Props) => {
    const navigate = useNavigate();

    // Calcular stock total de todas las variantes
    const stock = variants.reduce((total, variant) => total + variant.stock, 0);

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
      <div className="flex flex-col gap-3 sm:gap-4 relative group">
        <div 
          onClick={handleProductClick}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 transition-all duration-300 ${
            stock === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-lg hover:border-cyan-300'
          }`}
        >
          <div className="flex w-full aspect-square items-center justify-center p-3 sm:p-4 overflow-hidden">
            {img ? (
              <img 
                src={img} 
                alt={name} 
                className="object-contain w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <HiPhoto size={60} className="sm:w-20 sm:h-20 transition-transform duration-300 ease-in-out group-hover:scale-105" />
                <p className="text-xs sm:text-sm mt-2">Sin imagen</p>
              </div>
            )}
          </div>
          
          <div className="absolute top-2 left-2">
            {stock === 0 && <Tag contentTag="Agotado"/>}
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center text-center px-1 sm:px-2">
          <h3 className="text-xs sm:text-sm md:text-base font-medium text-slate-800 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {name}
          </h3>
          <p className="text-sm sm:text-base md:text-lg font-bold text-cyan-600">
            {formatPrice(price || (variants[0]?.price || 0))}
          </p>
        </div>
      </div>
    );
};