import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useAddressesByUser, useCreateAddress, useUpdateAddress, useDeleteAddress } from '../hooks/useAddresses';
import { LuLoaderCircle, LuPlus, LuPencil, LuTrash2, LuCheck } from 'react-icons/lu';
import type { Address, AddressFormData } from '../services/addressService';

export const AddressesPage = () => {
  const { session } = useUser();
  const userId = session?.user?.id || '';
  
  const { data: addresses = [], isLoading } = useAddressesByUser(userId);
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress(userId);
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress(userId);
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress(userId);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Chile',
    isDefault: false
  });

  if (!session) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      updateAddress(
        { addressId: editingAddress.id, data: formData },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingAddress(null);
            resetForm();
          }
        }
      );
    } else {
      createAddress(formData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = (addressId: string) => {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      deleteAddress(addressId);
    }
  };

  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Chile',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LuLoaderCircle className="animate-spin" size={60} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Direcciones</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LuPlus size={20} />
            Nueva Dirección
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Calle y Número</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Av. Libertador 1234"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Santiago"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Región/Estado</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Región Metropolitana"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código Postal</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="8320000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">País</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Establecer como dirección predeterminada
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <LuLoaderCircle className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  editingAddress ? 'Actualizar' : 'Crear'
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

      {/* Lista de direcciones */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tienes direcciones guardadas</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Agregar primera dirección
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white p-6 rounded-lg shadow-md relative"
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  <LuCheck size={14} />
                  Por defecto
                </div>
              )}

              <div className="pr-24">
                <p className="font-semibold text-lg mb-2">{address.street}</p>
                <p className="text-gray-600">
                  {address.city}, {address.state}
                </p>
                <p className="text-gray-600">
                  {address.postalCode}, {address.country}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(address)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <LuPencil size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <LuTrash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
