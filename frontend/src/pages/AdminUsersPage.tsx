import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import {
  useAllUsers,
  useDeleteUser,
  useUpdateUserRole,
  useUserProfile,
} from '../hooks/useUsers';
import { LuLoaderCircle, LuTrash2, LuShield, LuUser } from 'react-icons/lu';
import { useModalStore } from '../store/modal.store';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const { session, isLoading: isLoadingSession } = useUser();
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const { data: users = [], isLoading } = useAllUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
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

  const handleDeleteUser = (
    userId: string,
    userName: string,
    authId: string,
  ) => {
    if (authId === session.user.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }

    useModalStore.getState().openConfirmModal({
      title: 'Eliminar usuario',
      message: `¿Estás seguro de eliminar al usuario "${userName}"?`,
      onConfirm: () => {
        deleteUser(userId);
        useModalStore.getState().closeConfirmModal();
      },
    });
  };

  const handleChangeRole = (
    authId: string,
    currentRole: string,
    userName: string,
  ) => {
    if (authId === session.user.id) {
      toast.error('No puedes cambiar tu propio rol');
      return;
    }

    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const roleText = newRole === 'admin' ? 'Administrador' : 'Cliente';

    useModalStore.getState().openConfirmModal({
      title: 'Cambiar rol de usuario',
      message: `¿Cambiar rol de "${userName}" a ${roleText}?`,
      onConfirm: () => {
        setSelectedUser(authId);
        updateRole(
          { userId: authId, role: newRole },
          {
            onSettled: () => {
              setSelectedUser(null);
              useModalStore.getState().closeConfirmModal();
            },
          },
        );
      },
    });
  };

  const filteredUsers = users.filter((user) => user.role === activeTab);
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentUsers = filteredUsers.slice(
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
        <Link
          to="/admin/products"
          className="text-gray-500 hover:text-blue-600 font-medium pb-2 transition-colors"
        >
          Gestión de Productos
        </Link>
        <Link
          to="/admin/users"
          className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 transition-colors"
        >
          Gestión de Usuarios
        </Link>
        <Link
          to="/admin/orders"
          className="text-gray-500 hover:text-blue-600 font-medium pb-2 transition-colors"
        >
          Gestión de Órdenes
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Total: {users.length} usuarios</p>
        </div>
        
        {/* Tabs de roles */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab('customer');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'customer' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'admin' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Administradores
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Fecha de registro
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.role === 'admin' ? (
                          <LuShield size={20} className="text-gray-600" />
                        ) : (
                          <LuUser size={20} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{user.fullName}</p>
                        {user.userId === session.user.id && (
                          <span className="text-xs text-blue-600">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          handleChangeRole(
                            user.userId,
                            user.role,
                            user.fullName,
                          )
                        }
                        disabled={
                          isUpdatingRole && selectedUser === user.userId
                        }
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cambiar rol"
                      >
                        {isUpdatingRole && selectedUser === user.userId ? (
                          <LuLoaderCircle className="animate-spin" size={18} />
                        ) : (
                          <LuShield size={18} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteUser(user.id, user.fullName, user.userId)
                        }
                        disabled={isDeleting || user.userId === session.user.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar usuario"
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

        {currentUsers.length === 0 && (
          <div className="text-center py-12">
            <LuUser size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No hay usuarios en esta categoría</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-gray-600 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
