import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interface para dirección
export interface Address {
  id: string;
  userId: string;
  street: string;
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
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Obtener direcciones de un usuario
export const getAddressesByUser = async (userId: string): Promise<Address[]> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/users/${userId}/addresses`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Obtener una dirección específica
export const getAddressById = async (userId: string, addressId: string): Promise<Address> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/users/${userId}/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Crear nueva dirección
export const createAddress = async (userId: string, addressData: AddressFormData): Promise<Address> => {
  const token = await getAuthToken();
  const response = await axios.post(`${API_URL}/users/${userId}/addresses`, addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Actualizar dirección
export const updateAddress = async (userId: string, addressId: string, addressData: AddressFormData): Promise<Address> => {
  const token = await getAuthToken();
  const response = await axios.put(`${API_URL}/users/${userId}/addresses/${addressId}`, addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Eliminar dirección
export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  const token = await getAuthToken();
  await axios.delete(`${API_URL}/users/${userId}/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
