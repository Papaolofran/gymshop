import { useState } from "react"
import { HiOutlineSearch } from "react-icons/hi"
import { IoMdClose } from "react-icons/io"
import { useGlobalStore } from "../../store/global.store.ts";
import { formatPrice } from "../../helpers/index.ts";
import { searchProducts } from "../../actions";
import type { Product } from "../../interfaces/product.interface.ts";

export const Search = () => {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const closeSheet = useGlobalStore (state => state.closeSheet);

  const handleSearch = async(e: React.FormEvent) => {
    e.preventDefault( );

      if(searchTerm.trim()){
        const products = await searchProducts(searchTerm);
        setSearchResults(products);

      }
    }
  
  return (
    <>
      <div className="py-5 px-7 flex gap-10 items-center border-b border-slate-200">
        <form className='flex gap-3 items-center flex-1' onSubmit={handleSearch}>  
          <HiOutlineSearch size={22} />
          <input type='text' placeholder="que busca?" className="outline-none w-full text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
        </form>
        <button onClick={closeSheet}>
          <IoMdClose size={25} className="text-black" />
        </button>
      </div>
      
      {/* Resultado de la búsqueda */}
      <div>
        {
          searchResults.length > 0 ? (
            <ul>
              {searchResults.map(product => (
                <li className="py-2 group" key={product.id}>
            <button className="flex items-center gap-3">
              <img src={product.images[0]} alt={product.name} className="h-20 w-20 object-contain p-3" />

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold group-hover:underline">
                  {product.name}
                </p>

                {/* Muestra la PRIMER variante del producto buscado */}

                <p className="text-[13px] text-gray-600"> 
                  {product.variants[0].color_name || product.variants[0].weight } /{' '} 
                  {product.variants[0].size || product.variants[0].flavor}
                </p>
                
                {/* Muestra el precio */}
                <p className="text-sm font-medium text-gray-600">
                  {formatPrice(product.variants[0].price)}
                </p>


              </div>
            </button>
          </li>
              ))}
            
        </ul>
            ) : (
              <p className="text-sm text-gray-600">
                No se encontraron resultados
              </p>
            )
        }
      </div>
    </>
  )
}

