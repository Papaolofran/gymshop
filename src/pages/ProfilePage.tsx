import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile, useUpdateUser, useDeleteOwnAccount } from '../hooks/useUsers';
import { LuLoaderCircle, LuUser, LuMail, LuPhone, LuTriangle } from 'react-icons/lu';
import { signOut } from '../actions/auth';

export const ProfilePage = () => {
  const { session } = useUser();
  const { data: userData, isLoading: loadingUser } = useUserProfile();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteOwnAccount();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });

  useEffect(() => {
    if (userData) {
      // Detectar si la cuenta ha sido eliminada (indicador: nombre = "[Usuario eliminado]")
      if (userData.fullName === '[Usuario eliminado]') {
        console.log('Cuenta eliminada detectada, cerrando sesión...');
        // Cerrar sesión automáticamente y redirigir
        signOut()
          .then(() => {
            // Limpiar datos de localStorage/sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            // Redirigir a la página de inicio
            window.location.href = '/';
          })
          .catch(err => {
            console.error('Error al cerrar sesión:', err);
            // Intentar redirigir de todos modos
            window.location.href = '/';
          });
        return;
      }

      setFormData({
        fullName: userData.fullName,
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  if (!userData) {
    return <div className="text-center py-12">Error al cargar perfil</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.id) return;
    
    updateUser(
      { userId: userData.id, data: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
        }
      }
    );
  };

  const handleCancel = () => {
    setFormData({
      fullName: userData.fullName,
      phone: userData.phone
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Gestiona tu información personal</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 sm:p-8">
        {!isEditing ? (
          // Vista de solo lectura
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <LuUser className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Nombre completo</p>
                <p className="font-semibold text-sm sm:text-base break-words">{userData.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <LuMail className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Correo electrónico</p>
                <p className="font-semibold text-sm sm:text-base break-all">{userData.email}</p>
                <p className="text-xs text-gray-500 mt-1">No se puede cambiar</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <LuPhone className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Teléfono</p>
                <p className="font-semibold text-sm sm:text-base">{userData.phone || 'No registrado'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-5 h-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs mt-1 flex-shrink-0">
                {userData.role === 'admin' ? 'A' : 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Rol</p>
                <p className="font-semibold text-sm sm:text-base capitalize">
                  {userData.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          // Formulario de edición
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                disabled
                value={userData.email}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                El correo no se puede cambiar
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Teléfono <span className="text-gray-400 text-xs">(Opcional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
              >
                {isPending ? (
                  <>
                    <LuLoaderCircle className="animate-spin" size={18} />
                    <span>Guardando...</span>
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="w-full sm:flex-1 border-2 border-slate-300 text-slate-700 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Zona de peligro - Solo mostrar si el usuario no es admin */}
      {userData && userData.role !== 'admin' && (
        <div className="mt-8 border border-red-200 rounded-xl p-5 sm:p-8 bg-red-50">
          <h2 className="text-lg sm:text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            <LuTriangle />
            Zona de Peligro
          </h2>
          
          <p className="text-sm sm:text-base text-red-600 mb-6">
            Las acciones en esta sección son permanentes y no se pueden deshacer.
          </p>
          
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-2 text-red-800">
              Eliminar mi cuenta
            </h3>
            <p className="text-xs sm:text-sm text-red-600 mb-4">
              Al eliminar tu cuenta, TODOS tus datos personales, pedidos, direcciones y cualquier otra información relacionada serán permanentemente borrados del sistema. Esta acción no puede deshacerse.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
              >
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
                <p className="font-semibold text-red-800 mb-3">
                  ¿Estás seguro que deseas eliminar tu cuenta?
                </p>
                <p className="text-xs sm:text-sm text-red-700 mb-4">
                  Esta acción es permanente y no se puede deshacer. TODOS tus datos, incluyendo pedidos, direcciones e información personal serán eliminados permanentemente.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteAccount()}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <LuLoaderCircle className="animate-spin" size={16} />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      'Sí, eliminar mi cuenta'
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
