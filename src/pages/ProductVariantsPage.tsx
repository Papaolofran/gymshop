import { useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile } from '../hooks/useUsers';
import { useVariantsByProduct, useCreateVariant, useUpdateVariant, useDeleteVariant } from '../hooks/useVariants';
import { LuLoaderCircle, LuPlus, LuPencil, LuTrash2, LuArrowLeft } from 'react-icons/lu';
import { formatPrice } from '../helpers';
import type { Variant, VariantFormData } from '../services/variantService';

export const ProductVariantsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { session } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  
  // Nota: useProduct espera slug, no ID. En producción necesitarías un endpoint diferente
  // Por ahora solo mostramos un placeholder
  const product = productId ? { name: 'Producto' } : null;
  const loadingProduct = false;
  const { data: variants = [], isLoading: loadingVariants } = useVariantsByProduct(productId || '');
  const { mutate: createVariant, isPending: isCreating } = useCreateVariant(productId || '');
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(productId || '');
  const { mutate: deleteVariant, isPending: isDeleting } = useDeleteVariant(productId || '');

  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    price: 0,
    stock: 0,
    color: '',
    colorName: '',
    size: '',
    flavor: '',
    weight: ''
  });

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
    setFormData({
      price: variant.price,
      stock: variant.stock,
      color: variant.color || '',
      colorName: variant.colorName || '',
      size: variant.size || '',
      flavor: variant.flavor || '',
      weight: variant.weight || ''
    });
    setShowForm(true);
  };

  const handleDelete = (variantId: string) => {
    if (confirm('¿Estás seguro de eliminar esta variante?')) {
      deleteVariant(variantId);
    }
  };

  const resetForm = () => {
    setFormData({
      price: 0,
      stock: 0,
      color: '',
      colorName: '',
      size: '',
      flavor: '',
      weight: ''
    });
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="29990"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color (código hex)</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="#FF0000"
                />
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
