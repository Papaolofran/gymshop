import { Separator } from "../shared/Separator";

// Marcas de Suplementos: Ena, Gentech, Star Nutrition
// Marcas de Ropa: Nike, Adidas, Under Armour
const availableBrands = [
  "Ena",
  "Gentech",
  "Star Nutrition",
  "Nike",
  "Adidas",
  "Under Armour"
];

const availableCategories = [
  "Suplementos",
  "Ropa"
];

interface Props {
    selectedBrands: string[];
    setSelectedBrands: (brands: string[]) => void;
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
}

export const ContainerFilter = ({ selectedBrands, setSelectedBrands, selectedCategories, setSelectedCategories }: Props) => {
    
    const handleBrandChange = (brand: string) => {
        if(selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const handleCategoryChange = (category: string) => {
        if(selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    return (
        <div className="p-4 sm:p-5 border border-slate-200 rounded-lg h-fit bg-white shadow-sm">
          <h3 className="font-semibold text-lg sm:text-xl mb-4">
            Filtros
          </h3>

          <Separator/>

          {/* FILTRO DE CATEGORÍAS */}
          <div className="flex flex-col gap-3 mb-6">
            <h4 className="text-base sm:text-lg font-medium text-slate-800">
              Categorías
            </h4>

            <div className="flex flex-col gap-2">
              {availableCategories.map((category) => (
                <label key={category} className="inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span className="ml-2 text-sm text-slate-700 group-hover:text-cyan-600 transition-colors">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator/>

          {/* FILTRO DE MARCAS */}
          <div className="flex flex-col gap-3 mt-6">
            <h4 className="text-base sm:text-lg font-medium text-slate-800">
              Marcas
            </h4>

            <div className="flex flex-col gap-2">
              {availableBrands.map((brand) => (
                <label key={brand} className="inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="ml-2 text-sm text-slate-700 group-hover:text-cyan-600 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
    );
};