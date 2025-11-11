import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile } from '../hooks/useUsers';
import { useProducts } from '../hooks/products/useProducts';
import { useDeleteProduct } from '../hooks/useProductsAdmin';
import { LuLoaderCircle, LuPlus, LuPencil, LuTrash2, LuPackage } from 'react-icons/lu';
import { formatPrice } from '../helpers';

export const AdminProductsPage = () => {
  const { session } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const { products = [], isLoading } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Verificar si el usuario es admin
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

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
      deleteProduct(productId);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">Total: {products.length} productos</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LuPlus size={20} />
          Nuevo Producto
        </Link>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 bg-gray-100 flex items-center justify-center">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <LuPackage size={60} />
                  <p className="text-sm mt-2">Sin imagen</p>
                </div>
              )}
              {product.highlighted && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                  Destacado
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              <p className="text-lg font-bold mb-4">{formatPrice(product.variants[0]?.price || 0)}</p>

              <div className="flex gap-2">
                <Link
                  to={`/admin/products/edit/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  <LuPencil size={16} />
                  Editar
                </Link>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  <LuTrash2 size={16} />
                  Eliminar
                </button>
              </div>

              <Link
                to={`/admin/products/${product.id}/variants`}
                className="block mt-2 text-center text-sm text-blue-600 hover:underline"
              >
                Gestionar Variantes
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <LuPackage size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
        </div>
      )}
    </div>
  );
};
