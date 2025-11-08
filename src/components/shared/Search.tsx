import { useState, useEffect } from "react"
import { HiOutlineSearch } from "react-icons/hi"
import { HiPhoto } from "react-icons/hi2"
import { IoMdClose } from "react-icons/io"
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../store/global.store.ts";
import { formatPrice } from "../../helpers/index.ts";
import { searchProducts } from "../../actions";
import type { Product } from "../../interfaces/product.interface.ts";

export const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const closeSheet = useGlobalStore (state => state.closeSheet);

  // Búsqueda en tiempo real
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        const products = await searchProducts(searchTerm);
        setSearchResults(products);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearch = async(e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleProductClick = (slug: string) => {
    closeSheet();
    navigate(`/productos/${slug}`);
  };
  
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
      <div className="p-5">
        {isSearching ? (
          <p className="text-sm text-gray-500 text-center py-8">Buscando...</p>
        ) : searchTerm.trim() && searchResults.length > 0 ? (
          <ul className="space-y-3">
            {searchResults.map(product => (
              <li key={product.id}>
                <button 
                  onClick={() => handleProductClick(product.slug)}
                  className="flex items-center gap-4 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-20 aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <HiPhoto size={40} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-left flex-1">
                    <p className="text-sm font-semibold group-hover:text-cyan-600 transition-colors">
                      {product.name}
                    </p>

                    <p className="text-[13px] text-gray-600"> 
                      {product.variants[0].color_name || product.variants[0].weight} /{' '} 
                      {product.variants[0].size || product.variants[0].flavor}
                    </p>
                    
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(product.variants[0].price)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : searchTerm.trim() && searchResults.length === 0 && !isSearching ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No se encontraron resultados para "{searchTerm}"
          </p>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            Escribe para buscar productos...
          </p>
        )}
      </div>
    </>
  )
}

