import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interface para crear/actualizar producto
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  brand: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  isFeatured?: boolean;
}

// Obtener producto por ID (admin)
export const getProductById = async (productId: string) => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Crear producto (admin)
export const createProduct = async (productData: ProductFormData) => {
  const token = await getAuthToken();
  const response = await axios.post(`${API_URL}/products`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Actualizar producto (admin)
export const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
  const token = await getAuthToken();
  const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Eliminar producto (admin)
export const deleteProduct = async (productId: string) => {
  const token = await getAuthToken();
  await axios.delete(`${API_URL}/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
