import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interface para usuario
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para actualizar usuario
export interface UpdateUserData {
  fullName?: string;
  phone?: string;
}

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (): Promise<User[]> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Obtener perfil del usuario autenticado
export const getUserProfile = async (): Promise<User> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Obtener un usuario por ID
export const getUserById = async (userId: string): Promise<User> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Actualizar usuario
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
  const token = await getAuthToken();
  const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Eliminar usuario (solo admin)
export const deleteUser = async (userId: string): Promise<void> => {
  const token = await getAuthToken();
  await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Cambiar rol de usuario (solo admin)
export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  const token = await getAuthToken();
  const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};
