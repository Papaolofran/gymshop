import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interface para variante
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para crear/actualizar variante
export interface VariantFormData {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  isActive?: boolean;
}

// Obtener variantes de un producto
export const getVariantsByProduct = async (productId: string): Promise<Variant[]> => {
  const response = await axios.get(`${API_URL}/products/${productId}/variants`);
  return response.data.data;
};

// Crear variante (admin)
export const createVariant = async (productId: string, variantData: VariantFormData): Promise<Variant> => {
  const token = await getAuthToken();
  const response = await axios.post(`${API_URL}/products/${productId}/variants`, variantData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Actualizar variante (admin)
export const updateVariant = async (
  productId: string,
  variantId: string,
  variantData: Partial<VariantFormData>
): Promise<Variant> => {
  const token = await getAuthToken();
  const response = await axios.put(
    `${API_URL}/products/${productId}/variants/${variantId}`,
    variantData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.data;
};

// Eliminar variante (admin)
export const deleteVariant = async (productId: string, variantId: string): Promise<void> => {
  const token = await getAuthToken();
  await axios.delete(`${API_URL}/products/${productId}/variants/${variantId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
