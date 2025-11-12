import { useState, useEffect } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile } from '../hooks/useUsers';
import { useVariantsByProduct, useCreateVariant, useUpdateVariant, useDeleteVariant } from '../hooks/useVariants';
import { useProductAdmin } from '../hooks/useProductsAdmin';
import { LuLoaderCircle, LuPlus, LuPencil, LuTrash2, LuArrowLeft } from 'react-icons/lu';
import { IoWarning } from 'react-icons/io5';
import { formatPrice } from '../helpers';
import type { Variant, VariantFormData } from '../services/variantService';
import toast from 'react-hot-toast';
import { useModalStore } from '../store/modal.store';

export const ProductVariantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { session } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  
  // Obtenemos los datos del producto incluyendo la categoría
  const { data: product, isLoading: loadingProduct } = useProductAdmin(productId);
  
  // Depuración: Ver la estructura completa del producto y categoría
  useEffect(() => {
    if (product) {
      console.log('Estructura completa del producto:', product);
      console.log('Categoría del producto:', product.categories);
      console.log('Nombre de categoría:', product.categories?.name);
      console.log('category_id:', product.categoryId);
      console.log('category:', product.category);
    }
  }, [product]);
  
  // Determinamos el tipo de producto basándonos en su categoría
  // Verificamos diferentes formatos posibles de la categoría y normalizamos nombres
  const getCategoryName = () => {
    // Comprobar todas las posibles ubicaciones de la categoría
    const categoryName = 
      product?.categories?.name || 
      product?.category?.name || 
      product?.categoryName ||
      '';
    
    // Normalizar el nombre de la categoría (minuscula, sin tildes, plural->singular)
    const normalizedName = categoryName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar tildes
    
    // Intentar identificar categorías comunes
    if (normalizedName.includes('ropa') || 
        normalizedName.includes('vestimenta') || 
        normalizedName.includes('indument')) {
      return 'ropa';
    }
    
    if (normalizedName.includes('suplement') || 
        normalizedName.includes('nutric') || 
        normalizedName.includes('protein')) {
      return 'suplementos';
    }
    
    // Devolver el nombre normalizado
    return normalizedName;
  };
  
  const categoryName = getCategoryName();
  const isClothing = categoryName === 'ropa';
  const isSupplement = categoryName === 'suplementos';
  
  // Imprimir resultados de detección
  useEffect(() => {
    if (product) {
      console.log('Nombre de categoría detectado:', categoryName);
      console.log('Es producto de ropa:', isClothing);
      console.log('Es suplemento:', isSupplement);
    }
  }, [product, categoryName, isClothing, isSupplement]);
  const { data: variants = [], isLoading: loadingVariants } = useVariantsByProduct(productId || '');
  const { mutate: createVariant, isPending: isCreating } = useCreateVariant(productId || '');
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(productId || '');
  const { mutate: deleteVariant, isPending: isDeleting } = useDeleteVariant(productId || '');

  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    price: isClothing ? (product?.variants?.[0]?.price || 0) : '',
    stock: '',
    color: '',
    colorName: '',
    size: '',
    flavor: '',
    weight: ''
  } as VariantFormData);
  
  // Valores predefinidos para sabores y pesos
  const PREDEFINED_FLAVORS = ['Vainilla', 'Chocolate', 'Frutilla', 'Sin sabor'];
  const PREDEFINED_WEIGHTS = ['150g', '250g', '300g', '500g', '1Kg'];
  
  // Valores predefinidos para tallas de ropa
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  // Resetear los campos no relevantes al cambiar de categoría
  useEffect(() => {
    if (isClothing) {
      setFormData(prev => ({ 
        ...prev, 
        flavor: '',
        weight: ''
      }));
    } else if (isSupplement) {
      setFormData(prev => ({
        ...prev,
        color: '',
        colorName: '',
        size: ''
      }));
    }
  }, [isClothing, isSupplement]);

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

  if (loadingProduct || loadingVariants) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">Producto no encontrado</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos según el tipo de producto
    if (isClothing) {
      if (!formData.color || !formData.colorName || !formData.size) {
        toast.error('Para productos de ropa, color y talla son obligatorios');
        return;
      }
    } else if (isSupplement) {
      if (!formData.flavor || !formData.weight) {
        toast.error('Para suplementos, sabor y peso son obligatorios');
        return;
      }
    }

    if (editingVariant) {
      updateVariant(
        { variantId: editingVariant.id, data: formData },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingVariant(null);
            resetForm();
          }
        }
      );
    } else {
      createVariant(formData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    // Asegurar que los valores sean del tipo correcto
    setFormData({
      price: isClothing ? (product?.variants?.[0]?.price || 0) : variant.price,
      stock: variant.stock,
      color: variant.color || '',
      colorName: variant.colorName || '', // Usar colorName en lugar de color_name
      size: variant.size || '',
      flavor: variant.flavor || '',
      weight: variant.weight || ''
    });
    setShowForm(true);
  };

  const handleDelete = (variantId: string) => {
    useModalStore.getState().openConfirmModal({
      title: "Eliminar variante",
      message: "¿Estás seguro de eliminar esta variante?",
      onConfirm: () => {
        deleteVariant(variantId);
        useModalStore.getState().closeConfirmModal();
      }
    });
  };

  const resetForm = () => {
    setFormData({
      price: isClothing ? (product?.variants?.[0]?.price || 0) : '',
      stock: '',
      color: '',
      colorName: '',
      size: '',
      flavor: '',
      weight: ''
    } as VariantFormData);
    setEditingVariant(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <LuArrowLeft size={20} />
        Volver a productos
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Variantes de {product.name}</h1>
          <p className="text-gray-600 mt-2">Total: {variants.length} variantes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LuPlus size={20} />
            Nueva Variante
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingVariant ? 'Editar Variante' : 'Nueva Variante'}
          </h2>
          
          {!isClothing && !isSupplement && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 flex items-center gap-3">
              <IoWarning className="text-yellow-600" size={20} />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">La categoría del producto no está reconocida como "Ropa" o "Suplementos".</p>
                <p className="mt-1">Detectado: "{product?.category?.name || product?.categories?.name || 'Sin categoría'}"</p>
                <p className="mt-1">Por favor, edita el producto y asigna una categoría válida (Ropa o Suplementos).</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio {isClothing ? '(heredado del producto base)' : '*'}
                  {isClothing && (
                    <span className="block text-xs text-gray-500">
                      En productos de ropa, el precio se hereda del producto base
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  required={!isClothing}
                  min="0"
                  step="0.01"
                  value={isClothing ? product.variants?.[0]?.price || 0 : formData.price}
                  onChange={(e) => {
                    if (!isClothing) {
                      const inputValue = e.target.value;
                      // Si el campo está vacío, permitirlo para que puedan escribir desde cero
                      if (inputValue === '') {
                        setFormData({ ...formData, price: '' as unknown as number })
                      } else {
                        setFormData({ ...formData, price: parseFloat(inputValue) as number })
                      }
                    }
                  }}
                  onBlur={() => {
                    // Al perder el foco, asegurarse de que el valor es válido
                    if (!isClothing && (formData.price === '' || isNaN(Number(formData.price)))) {
                      setFormData({ ...formData, price: 0 })
                    }
                  }}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${isClothing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="29990"
                  disabled={isClothing}
                  readOnly={isClothing}
                  title={isClothing ? "El precio se hereda del producto base" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Si el campo está vacío, permitirlo para que puedan escribir desde cero
                    if (inputValue === '') {
                      setFormData({ ...formData, stock: '' })
                    } else {
                      setFormData({ ...formData, stock: parseInt(inputValue) })
                    }
                  }}
                  onBlur={() => {
                    // Al perder el foco, asegurarse de que el valor es válido
                    if (formData.stock === '' || isNaN(Number(formData.stock))) {
                      setFormData({ ...formData, stock: 0 })
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="50"
                />
              </div>

              {/* Campos para productos de ropa */}
              {isClothing && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color || '#000000'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-20 p-1 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="#FF0000"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombre del color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={isClothing}
                      value={formData.colorName}
                      onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Rojo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Talla <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isClothing}
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="">Seleccionar talla</option>
                      {CLOTHING_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Campos para suplementos */}
              {isSupplement && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sabor <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isSupplement}
                      value={formData.flavor}
                      onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="">Seleccionar sabor</option>
                      {PREDEFINED_FLAVORS.map(flavor => (
                        <option key={flavor} value={flavor}>{flavor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Peso <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isSupplement}
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="">Seleccionar peso</option>
                      {PREDEFINED_WEIGHTS.map(weight => (
                        <option key={weight} value={weight}>{weight}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {/* Mostrar campos personalizados si no es una categoría reconocida */}
              {!isClothing && !isSupplement && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color (código hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color || '#000000'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-20 p-1 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="#FF0000"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre del color</label>
                    <input
                      type="text"
                      value={formData.colorName}
                      onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Rojo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Talla/Tamaño</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="XL, M, L"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sabor</label>
                    <input
                      type="text"
                      value={formData.flavor}
                      onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Chocolate, Vainilla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Peso</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="1kg, 500g"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <LuLoaderCircle className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  editingVariant ? 'Actualizar' : 'Crear'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de variantes */}
      {variants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">No hay variantes para este producto</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Crear primera variante
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Precio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Color</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Talla</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Sabor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Peso</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold">{formatPrice(variant.price)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={variant.stock === 0 ? 'text-red-600 font-semibold' : ''}>
                      {variant.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {variant.color && variant.colorName ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: variant.color }}
                        />
                        <span>{variant.colorName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{variant.size || '-'}</td>
                  <td className="px-6 py-4 text-sm">{variant.flavor || '-'}</td>
                  <td className="px-6 py-4 text-sm">{variant.weight || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(variant)}
                        disabled={isDeleting}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <LuPencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <LuTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
