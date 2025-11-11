import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useUserProfile, useUpdateUser } from '../hooks/useUsers';
import { LuLoaderCircle, LuUser, LuMail, LuPhone } from 'react-icons/lu';

export const ProfilePage = () => {
  const { session } = useUser();
  const { data: userData, isLoading: loadingUser } = useUserProfile();
  const { mutate: updateUser, isPending } = useUpdateUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName,
        phone: userData.phone
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
                <p className="font-semibold text-sm sm:text-base">{userData.phone}</p>
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
                Teléfono
              </label>
              <input
                type="tel"
                required
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
    </div>
  );
};
