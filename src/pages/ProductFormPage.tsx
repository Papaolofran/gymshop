import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile } from '../hooks/useUsers';
import { useProductAdmin, useCreateProduct, useUpdateProduct } from '../hooks/useProductsAdmin';
import { useCategories } from '../hooks/useCategories';
import { LuLoaderCircle } from 'react-icons/lu';

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  'Suplementos': ['Ena', 'Gentech', 'Star Nutrition'],
  'Suplemento': ['Ena', 'Gentech', 'Star Nutrition'],
  'Ropa': ['Adidas', 'Nike', 'Under Armour']
};

// Función auxiliar para obtener marcas según categoría
const getBrandsByCategory = (categoryName: string): string[] => {
  // Normalizar el nombre (trim y case-insensitive)
  const normalized = categoryName.trim();
  
  // Buscar exacto o con variaciones
  return BRANDS_BY_CATEGORY[normalized] || 
         BRANDS_BY_CATEGORY[normalized.toLowerCase()] || 
         BRANDS_BY_CATEGORY[normalized + 's'] ||
         BRANDS_BY_CATEGORY[normalized.slice(0, -1)] || // Quitar 's' final
         [];
};

export const ProductFormPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { session } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const isEditing = !!productId;

  const { data: product, isLoading: isLoadingProduct } = useProductAdmin(productId);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brand: '',
    basePrice: 0,
    categoryId: '',
    images: [''],
    isFeatured: false
  });

  // Obtener categoría seleccionada
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const availableBrands = selectedCategory ? getBrandsByCategory(selectedCategory.name) : [];
  
  // Debug: Ver qué categoría está seleccionada
  useEffect(() => {
    if (selectedCategory) {
      console.log('Categoría seleccionada:', selectedCategory.name);
      console.log('Marcas disponibles:', availableBrands);
    }
  }, [selectedCategory, availableBrands]);

  // Resetear marca cuando cambia la categoría
  const handleCategoryChange = (categoryId: string) => {
    setFormData({ 
      ...formData, 
      categoryId,
      brand: '' // Resetear marca al cambiar categoría
    });
  };

  // Cargar datos del producto cuando está editando
  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        brand: product.brand || '',
        basePrice: product.variants?.[0]?.price || 0,
        categoryId: product.categoryId || '',
        images: product.images && product.images.length > 0 ? product.images : [''],
        isFeatured: product.isFeatured || false
      });
    }
  }, [product, isEditing]);

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  if (userData?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredImages = formData.images.filter(img => img.trim() !== '');

    if (isEditing && productId) {
      updateProduct(
        { productId, data: { ...formData, images: filteredImages } },
        {
          onSuccess: () => navigate('/admin/products')
        }
      );
    } else {
      createProduct(
        { ...formData, images: filteredImages },
        {
          onSuccess: () => navigate('/admin/products')
        }
      );
    }
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del producto</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Proteína Whey 1kg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug (URL amigable)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="proteina-whey-1kg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Describe el producto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          {isLoadingCategories ? (
            <div className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-400">
              Cargando categorías...
            </div>
          ) : (
            <select
              required
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Marca</label>
            <select
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${!formData.categoryId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={!formData.categoryId}
            >
              <option value="">
                {!formData.categoryId ? 'Selecciona una categoría primero' : 'Selecciona una marca'}
              </option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Precio base</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="29990"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Imágenes (URLs)
            <span className="block text-xs text-gray-500 font-normal mt-1">
              Por ahora usa URLs de imágenes alojadas en servicios como Imgur, Cloudinary, etc.
            </span>
          </label>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImage}
            className="text-sm text-blue-600 hover:underline"
          >
            + Agregar otra imagen
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium">
            Producto destacado
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {(isCreating || isUpdating) ? (
              <>
                <LuLoaderCircle className="animate-spin" size={20} />
                Guardando...
              </>
            ) : (
              isEditing ? 'Actualizar Producto' : 'Crear Producto'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
