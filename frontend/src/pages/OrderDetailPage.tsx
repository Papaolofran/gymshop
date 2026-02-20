import { Navigate, useParams } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useOrderById, useCancelOrder } from '../hooks/useOrders';
import { formatPrice } from '../helpers';
import { LuLoaderCircle, LuPackage, LuX } from 'react-icons/lu';
import { HiPhoto } from 'react-icons/hi2';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { session } = useUser();
  const { data: order, isLoading, isError } = useOrderById(orderId || '');
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  // Function to handle order cancellation
  const handleCancelOrder = () => {
    if (!orderId) return;
    
    cancelOrder(orderId, {
      onSuccess: () => {
        setShowConfirmCancel(false);
      }
    });
  };

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <LuPackage size={60} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Orden no encontrada</h2>
        <p className="text-gray-600">No se pudo cargar la información de esta orden</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Orden #{order.id}</h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            
            {/* Show cancel button only if order is in pending or processing state */}
            {['pending', 'processing'].includes(order.status) && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                disabled={isCancelling}
              >
                <LuX size={16} />
                {isCancelling ? 'Cancelando...' : 'Cancelar Orden'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Productos y dirección */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Productos ({order.items.length})</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.variant.product.images && item.variant.product.images.length > 0 ? (
                      <img
                        src={item.variant.product.images[0]}
                        alt={item.variant.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiPhoto className="text-gray-400" size={40} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.variant.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.variant.color && item.variant.colorName && (
                        <span className="mr-2">Color: {item.variant.colorName}</span>
                      )}
                      {item.variant.size && (
                        <span className="mr-2">Talla: {item.variant.size}</span>
                      )}
                      {item.variant.flavor && (
                        <span className="mr-2">Sabor: {item.variant.flavor}</span>
                      )}
                      {item.variant.weight && (
                        <span className="mr-2">Peso: {item.variant.weight}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
            
            <div className="text-gray-700">
              <p className="font-medium">{order.address.street}</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.postalCode}</p>
              <p>{order.address.country}</p>
            </div>
          </div>
        </div>

        {/* Columna derecha - Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Tracking info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Estado de la orden</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Orden creada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">En proceso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Enviado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Entregado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">¿Cancelar esta orden?</h3>
            <p className="mb-6 text-gray-600">
              ¿Estás seguro que deseas cancelar la orden #{order.id}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCancelling}
              >
                No, mantener orden
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelando...' : 'Sí, cancelar orden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
