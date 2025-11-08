import { LuMinus, LuPlus } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { HiPhoto } from "react-icons/hi2";
import { formatPrice } from "../../helpers";
import { useCartStore } from "../../store/cart.store";

export interface ICartItem {
  variantId: string;
  productId: string;
  name: string;
  brand: string;
  categoryName: string;
  // Propiedades para ropa
  color?: string;
  colorName?: string;
  size?: string;
  // Propiedades para suplementos
  weight?: string;
  flavor?: string;
  price: number;
  quantity: number;
  image: string;
  stock: number; // Stock disponible de esta variante
}

interface Props {
  item: ICartItem;
}

export const CartItem = ({ item }: Props) => {
    const incrementItem = useCartStore(state => state.incrementItem);
    const decrementItem = useCartStore(state => state.decrementItem);
    const removeItem = useCartStore(state => state.removeItem);

    const increment = () => {
      incrementItem(item.variantId);
    };
    
    const decrement = () => {
      decrementItem(item.variantId);
    };
    
    const handleRemove = () => {
      removeItem(item.variantId);
    };


  return (
      <li className="flex justify-between items-start gap-5 relative">
        <div className="flex w-20 aspect-square bg-gray-100 rounded-lg items-center justify-center p-2 flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <HiPhoto size={40} className="text-gray-400" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button 
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <IoMdClose size={20} />
                </button>
                <p className="text-sm font-medium text-gray-600">
                    {formatPrice(item.price)}
                </p>
              </div>
          </div>

          <div className="flex gap-3">
            {/* Mostrar atributos según el tipo de producto */}
            {item.categoryName?.toLowerCase() === 'ropa' && (
              <p className="text-[13px] text-gray-600">
                {item.colorName} / Talla: {item.size}
              </p>
            )}
            {item.categoryName?.toLowerCase() === 'suplementos' && (
              <p className="text-[13px] text-gray-600">
                {item.weight} / Sabor: {item.flavor}
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-5 px-2 py-1 border border-slate-200 w-fit rounded-full">
                  <button 
                    onClick={decrement}
                    disabled={item.quantity === 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuMinus size={15}/>
                  </button>
                  <span className="text-slate-500 text-sm">{item.quantity}</span>
                  <button 
                    onClick={increment}
                    disabled={item.quantity >= item.stock}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    title={item.quantity >= item.stock ? `Stock máximo: ${item.stock}` : ''}
                  >
                    <LuPlus size={15}/>
                  </button>
            </div>
            {item.quantity >= item.stock && (
              <span className="text-xs text-orange-600">Stock máximo</span>
            )}
          </div>
        </div>
      </li>


  );
};