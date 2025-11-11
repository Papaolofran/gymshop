import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useUser } from '../hooks/auth/useUser';
import { useCreateOrder } from '../hooks/useOrders';
import { useAddressesByUser } from '../hooks/useAddresses';
import { formatPrice } from '../helpers';
import { LuLoaderCircle, LuCheck } from 'react-icons/lu';
import { HiPhoto } from 'react-icons/hi2';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { session } = useUser();
  const userId = session?.user?.id || '';
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { data: addresses = [], isLoading: loadingAddresses } = useAddressesByUser(userId);
  
  const [selectedAddress, setSelectedAddress] = useState('');

  // Redirigir si no hay sesión
  if (!session?.user) {
    return <Navigate to="/login" />;
  }

  // Redirigir si el carrito está vacío
  if (items.length === 0) {
    return <Navigate to="/products" />;
  }

  const handleCheckout = () => {
    if (!selectedAddress) {
      alert('Por favor selecciona una dirección de envío');
      return;
    }

    const orderData = {
      addressId: selectedAddress,
      items: items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))
    };

    createOrder(orderData, {
      onSuccess: (order) => {
        clearCart();
        navigate(`/orders/${order.id}`);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA - Dirección y productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sección de dirección */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Dirección de Envío</h2>
              <Link 
                to="/account/direcciones" 
                className="text-sm text-blue-600 hover:underline"
              >
                Gestionar direcciones
              </Link>
            </div>
            
            {loadingAddresses ? (
              <div className="flex justify-center py-8">
                <LuLoaderCircle className="animate-spin" size={30} />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No tienes direcciones guardadas
                </p>
                <Link
                  to="/account/direcciones"
                  className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                >
                  Agregar dirección
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddress === address.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{address.street}</p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.postalCode}, {address.country}
                        </p>
                      </div>
                      {selectedAddress === address.id && (
                        <LuCheck className="text-black" size={24} />
                      )}
                    </div>
                    {address.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Por defecto
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Productos en el carrito */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              Productos ({items.length})
            </h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiPhoto className="text-gray-400" size={40} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.color && <span className="mr-2">Color: {item.colorName}</span>}
                      {item.size && <span className="mr-2">Talla: {item.size}</span>}
                      {item.weight && <span className="mr-2">Peso: {item.weight}</span>}
                      {item.flavor && <span className="mr-2">Sabor: {item.flavor}</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-2xl font-semibold mb-4">Resumen</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isPending || !selectedAddress}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold mt-6 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                'Confirmar Compra'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
