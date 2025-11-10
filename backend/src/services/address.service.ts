import { AddressRepository } from '../repositories/address.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interface para dirección de BD
interface AddressFromDB {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Service: Capa de lógica de negocio para direcciones
// Valida que el usuario exista y que solo pueda gestionar sus propias direcciones
export class AddressService {
  private addressRepository: AddressRepository;
  private userRepository: UserRepository;

  constructor() {
    this.addressRepository = new AddressRepository();
    this.userRepository = new UserRepository();
  }

  // Obtener todas las direcciones de un usuario
  async getAddressesByUser(userId: string, requestUserId: string) {
    try {
      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para ver estas direcciones');
      }

      const addresses = await this.addressRepository.findByUserId(userId);

      return addresses.map(this.transformAddress);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener direcciones');
    }
  }

  // Obtener una dirección específica
  async getAddressById(id: string, userId: string, requestUserId: string) {
    try {
      const address = await this.addressRepository.findById(id);

      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      if (address.user_id !== userId) {
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para ver esta dirección');
      }

      return this.transformAddress(address);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener dirección');
    }
  }

  // Crear nueva dirección
  async createAddress(userId: string, requestUserId: string, addressData: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }) {
    try {
      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para crear direcciones para este usuario');
      }

      const user = await this.userRepository.findByUserId(userId);

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      // Si se marca como predeterminada, quitar el estado de las demás
      if (addressData.isDefault) {
        await this.addressRepository.unsetDefaultForUser(userId);
      }

      const address = await this.addressRepository.create({
        user_id: userId,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode,
        country: addressData.country,
        is_default: addressData.isDefault || false
      });

      return this.transformAddress(address);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al crear dirección');
    }
  }

  // Actualizar dirección
  async updateAddress(id: string, userId: string, requestUserId: string, addressData: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }) {
    try {
      const address = await this.addressRepository.findById(id);

      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      if (address.user_id !== userId) {
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para actualizar esta dirección');
      }

      // Si se marca como predeterminada, quitar el estado de las demás
      if (addressData.isDefault && !address.is_default) {
        await this.addressRepository.unsetDefaultForUser(userId);
      }

      const updateData: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
        is_default?: boolean;
      } = {};

      if (addressData.street) updateData.street = addressData.street;
      if (addressData.city) updateData.city = addressData.city;
      if (addressData.state) updateData.state = addressData.state;
      if (addressData.postalCode) updateData.postal_code = addressData.postalCode;
      if (addressData.country) updateData.country = addressData.country;
      if (addressData.isDefault !== undefined) updateData.is_default = addressData.isDefault;

      const updatedAddress = await this.addressRepository.update(id, updateData);

      return this.transformAddress(updatedAddress);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar dirección');
    }
  }

  // Eliminar dirección
  async deleteAddress(id: string, userId: string, requestUserId: string) {
    try {
      const address = await this.addressRepository.findById(id);

      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      if (address.user_id !== userId) {
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para eliminar esta dirección');
      }

      await this.addressRepository.delete(id);

      return { message: 'Dirección eliminada correctamente' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al eliminar dirección');
    }
  }

  // Transformar dirección de BD a formato del frontend
  private transformAddress(address: AddressFromDB) {
    return {
      id: address.id,
      userId: address.user_id,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      isDefault: address.is_default,
      createdAt: address.created_at,
      updatedAt: address.updated_at
    };
  }
}
