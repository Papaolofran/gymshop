import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile } from '../hooks/useUsers';
import { useAllOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { LuLoaderCircle, LuSearch, LuPackage } from 'react-icons/lu';
import { formatPrice } from '../helpers';
import type { Order } from '../services/orderService';
import { useModalStore } from '../store/modal.store';
import { Pagination } from '../components/shared/Pagination';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
  pending: 'Orden creada',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

export const AdminOrdersPage = () => {
  const { session, isLoading: isLoadingSession } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const { data: orders = [], isLoading } = useAllOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Verificar si el usuario es admin
  if (isLoadingSession) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin text-blue-600" size={60} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin text-blue-600" size={60} />
      </div>
    );
  }

  if (userData?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleStatusChange = (orderId: string, newStatus: string, oldStatus: string) => {
    if (newStatus === oldStatus) return;

    useModalStore.getState().openConfirmModal({
      title: "Actualizar estado",
      message: `¿Cambiar el estado de la orden #${orderId} a ${statusLabels[newStatus]}?`,
      onConfirm: () => {
        updateStatus({ orderId, status: newStatus }, {
          onSettled: () => {
             useModalStore.getState().closeConfirmModal();
          }
        });
      }
    });
  };

  const filteredOrders = orders.filter((order: Order) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = order.user?.fullName?.toLowerCase() || '';
    const customerEmail = order.user?.email?.toLowerCase() || '';
    const orderIdStr = order.id.toString();

    const matchesSearch = 
      orderIdStr.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower);

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin text-blue-600" size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Navegación Admin */}
      <div className="flex gap-6 border-b border-gray-200 mb-8 pb-2">
        <Link to="/admin/products" className="text-gray-500 hover:text-blue-600 font-medium pb-2 transition-colors">
          Gestión de Productos
        </Link>
        <Link to="/admin/users" className="text-gray-500 hover:text-blue-600 font-medium pb-2 transition-colors">
          Gestión de Usuarios
        </Link>
        <Link to="/admin/orders" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 transition-colors">
          Gestión de Órdenes
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
          <p className="text-gray-600 mt-2">Total: {orders.length} órdenes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 md:max-w-md">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o email del cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabla de órdenes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Orden ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm text-gray-900">{order.user?.fullName || 'Cliente anónimo'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id.toString(), e.target.value, order.status)}
                      disabled={isUpdating}
                      className={`text-sm rounded-full px-4 py-1 text-center font-medium bg-transparent border cursor-pointer outline-none focus:ring-2 disabled:opacity-50 appearance-none ${statusColors[order.status]}`}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none', textAlignLast: 'center' }}
                    >
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val} className="text-gray-900 bg-white text-left">
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      target="_blank"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentOrders.length === 0 && (
          <div className="text-center py-12">
            <LuPackage size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm || statusFilter 
                ? 'No se encontraron órdenes con estos filtros' 
                : 'No hay órdenes registradas'}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <Pagination totalItems={filteredOrders.length} page={currentPage} setPage={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
};
