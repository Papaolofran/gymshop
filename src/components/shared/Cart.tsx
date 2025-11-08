import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useGlobalStore } from "../../store/global.store.ts";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { RiSecurePaymentLine } from "react-icons/ri";
import { CartItem } from "./CartItem.tsx";
import { useCartStore } from "../../store/cart.store.ts";
import { formatPrice } from "../../helpers";

export const Cart = () => {
  const closeSheet = useGlobalStore(state => state.closeSheet);
  const items = useCartStore(state => state.items);
  const clearCart = useCartStore(state => state.clearCart);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return <div className="flex flex-col h-full">
    <div className="px-5 py-7 flex justify-between items-center border-b border-slate-200">
      <span className="flex gap-3 items-center font-semibold">
        <HiOutlineShoppingBag size={20} />
        {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
      </span>

      <button onClick={closeSheet}>
                <IoMdClose size={25} className="text-black" />
              </button>

    </div>

    {/* Lista de productos agregados al carrito */}
    {items.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        <p className="text-gray-500 text-center">
          Tu carrito está vacío<br />
          <span className="text-sm">Agrega productos para comenzar</span>
        </p>
        <Link
          to="/productos"
          onClick={closeSheet}
          className="bg-black text-white px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm"
        >
          Empezar a comprar
        </Link>
      </div>
    ) : (
      <>
        <div className="p-7 overflow-auto flex-1">
          <ul className="space-y-6">
            {items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </ul>
        </div> 

        {/* Total y botones */}
        <div className="mt-4 p-7 border-t border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
          </div>
          
          <Link 
            to="/checkout"
            onClick={closeSheet}
            className="w-full bg-black text-white py-3.5 rounded-full flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
          >
            <RiSecurePaymentLine size={24} />
            Continuar con la compra
          </Link>

          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                clearCart();
              }
            }}
            className="mt-3 w-full text-black border border-black rounded-full py-3 hover:bg-gray-100 transition-colors"
          >
            Limpiar carrito
          </button>
        </div>
      </>
    )}
  </div>;
}
