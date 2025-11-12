import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Interface para dirección
export interface Address {
  id: string;
  userId: string;
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para crear/actualizar dirección
export interface AddressFormData {
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Obtener direcciones de un usuario
export const getAddressesByUser = async (userId: string): Promise<Address[]> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`/users/${userId}/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error getting addresses for user ${userId}:`, error);
    throw error;
  }
};

// Obtener una dirección específica
export const getAddressById = async (userId: string, addressId: string): Promise<Address> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`/users/${userId}/addresses/${addressId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error getting address ${addressId} for user ${userId}:`, error);
    throw error;
  }
};

// Crear nueva dirección
export const createAddress = async (userId: string, addressData: AddressFormData): Promise<Address> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post(`/users/${userId}/addresses`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error creating address for user ${userId}:`, error);
    throw error;
  }
};

// Actualizar dirección
export const updateAddress = async (userId: string, addressId: string, addressData: AddressFormData): Promise<Address> => {
  try {
    console.log(`Updating address ${addressId} for user ${userId} with data:`, addressData);
    const token = await getAuthToken();
    const response = await apiClient.put(`/users/${userId}/addresses/${addressId}`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Address update response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating address ${addressId} for user ${userId}:`, error);
    throw error;
  }
};

// Eliminar dirección
export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  try {
    console.log(`Deleting address ${addressId} for user ${userId}`);
    
    // Verificar que tenemos un token válido
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    // Crear un cliente con timeout mayor para esta operación específica
    const client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // 15 segundos para operaciones de eliminación
    });
    
    // Intentar la eliminación con el cliente personalizado
    await client.delete(`/users/${userId}/addresses/${addressId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Address deleted successfully');
  } catch (error) {
    // Mejorar el manejo de errores
    const err = error as { 
      code?: string; 
      response?: { 
        status: number; 
        data?: { message?: string } 
      };
      message?: string;
    };
    
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      console.error('Error de conexión con el servidor. Verifica que el backend esté en ejecución.');
      throw new Error('Error de conexión con el servidor. Verifica que el backend esté en ejecución.');
    } else if (err.response) {
      console.error(`Error del servidor (${err.response.status}):`, err.response.data);
      throw new Error(err.response.data?.message || `Error del servidor: ${err.response.status}`);
    } else {
      console.error(`Error eliminando dirección ${addressId}:`, err);
      throw new Error(`Error al eliminar la dirección: ${err.message || 'Error desconocido'}`);
    }
  }
};
