import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useGlobalStore } from "../../store/global.store.ts";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { RiSecurePaymentLine } from "react-icons/ri";
import { CartItem } from "./CartItem.tsx";

export const Cart = () => {
  const closeSheet = useGlobalStore (state => state.closeSheet);

  return <div className="flex flex-col h-full">
    <div className="px-5 py-7 flex justify-between items-center border-b border-slate-200">
      <span className="flex gap-3 items-center font-semibold">
        <HiOutlineShoppingBag size={20} />4 articulos
      </span>

      <button onClick={closeSheet}>
                <IoMdClose size={25} className="text-black" />
              </button>

    </div>

    {/* Lista de productos agregados al carrito */}
     <>
        <div className="p-7 overflow-auto flex-1">

          <ul>
            <li>
              <CartItem 
                item={{}}
              />
            </li>
          </ul>
        </div> 

        {/* botones */}

        <div className="mt-4 p-7">
          lin
          <Link to ="/checkout"
            className="w-full bg-black text-white py-3.5 rounded-full flex items-center justify-center gap-3"
          >
            <RiSecurePaymentLine size={24} />
            Continuar con la compra
          </Link>

          <button className="mt-3 w-full text-black border border-black rounded-full py-3">
            limpiar carrito
          </button>
        </div>
     </>
  </div>;
}
