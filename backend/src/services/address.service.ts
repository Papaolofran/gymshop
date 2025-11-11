import { AddressRepository } from '../repositories/address.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interface para dirección de BD
interface AddressFromDB {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
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

      // Obtener el ID de la tabla users
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      const addresses = await this.addressRepository.findByUserId(user.id);

      return addresses.map((a) => this.transformAddress(a));
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

      const address = await this.addressRepository.create({
        user_id: user.id,
        address_line1: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode,
        country: addressData.country
      });

      return this.transformAddress(address);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error detallado al crear dirección:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new ApiError(500, `Error al crear dirección: ${errorMessage}`);
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

      const updateData: {
        address_line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      } = {};

      if (addressData.street) updateData.address_line1 = addressData.street;
      if (addressData.city) updateData.city = addressData.city;
      if (addressData.state) updateData.state = addressData.state;
      if (addressData.postalCode) updateData.postal_code = addressData.postalCode;
      if (addressData.country) updateData.country = addressData.country;

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
      street: address.address_line1,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      isDefault: false, // Siempre false ya que no existe en BD
      createdAt: address.created_at,
      updatedAt: address.updated_at
    };
  }
}
