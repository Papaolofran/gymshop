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
    addressLine2?: string;
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
        address_line2: addressData.addressLine2 || null,
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
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }) {
    try {
      // Primero verificar que el usuario existe
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      // Debuggear la autenticación y verificación de la dirección
      console.log('Update Address - Auth UserId:', userId);
      console.log('Update Address - Request UserId:', requestUserId);
      console.log('Update Address - DB User:', user);
      
      const address = await this.addressRepository.findById(id);

      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      console.log('Update Address - Found address:', address);
      
      // Verificar que la dirección pertenece al usuario por su ID interno (user.id)
      // Es importante usar el id de la tabla users y NO el UUID de Auth
      console.log(`Comparing address.user_id (${address.user_id}) with user.id (${user.id})`);
      
      // Comparar con el ID de la tabla users, no con el UUID de Auth
      // Convertir a string para asegurar comparación correcta de tipos
      if (String(address.user_id) !== String(user.id)) {
        console.log('Address user_id type:', typeof address.user_id);
        console.log('User id type:', typeof user.id);
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para actualizar esta dirección');
      }

      const updateData: {
        address_line1?: string;
        address_line2?: string | null;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      } = {};

      if (addressData.street) updateData.address_line1 = addressData.street;
      if (addressData.addressLine2 !== undefined) updateData.address_line2 = addressData.addressLine2 || null;
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
      // Primero verificar que el usuario existe
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }
      
      console.log('Delete Address - Auth UserId:', userId);
      console.log('Delete Address - Request UserId:', requestUserId);
      console.log('Delete Address - DB User:', user);
      
      const address = await this.addressRepository.findById(id);

      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      console.log('Delete Address - Found address:', address);
      console.log(`Comparing address.user_id (${address.user_id}) with user.id (${user.id})`);

      // Comparar con el ID de la tabla users, no con el UUID de Auth
      // Convertir a string para asegurar comparación correcta de tipos
      if (String(address.user_id) !== String(user.id)) {
        console.log('Address user_id type:', typeof address.user_id);
        console.log('User id type:', typeof user.id);
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      if (userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para eliminar esta dirección');
      }
      
      // Verificar si la dirección está siendo utilizada en alguna orden
      const ordersUsingAddress = await this.addressRepository.findOrdersByAddressId(id);
      
      if (ordersUsingAddress && ordersUsingAddress.length > 0) {
        // En lugar de impedir la eliminación, vamos a copiar los datos de la dirección
        // a los pedidos asociados antes de eliminarla
        console.log(`La dirección ${id} está asociada a ${ordersUsingAddress.length} órdenes. Copiando datos antes de eliminar...`);
        
        try {
          // Copiar datos de dirección a los pedidos y eliminar la referencia
          await this.addressRepository.copyAddressDataToOrders(id);
          console.log('Datos de dirección copiados exitosamente a los pedidos');
        } catch (copyError) {
          console.error('Error al copiar datos de dirección a pedidos:', copyError);
          throw new ApiError(500, 'Error al preparar la dirección para eliminación');
        }
      }

      try {
        await this.addressRepository.delete(id);
        console.log('Dirección eliminada correctamente en la base de datos');
      } catch (deleteError) {
        console.error('Error al eliminar dirección en la base de datos:', deleteError);
        throw new ApiError(500, 'Error al eliminar dirección en la base de datos');
      }

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
      addressLine2: address.address_line2 || undefined,
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
