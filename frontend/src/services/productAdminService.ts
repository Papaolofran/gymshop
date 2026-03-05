import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'bypass-tunnel-reminder': 'true'
  }
});

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

// Subir imagen de producto a Supabase Storage
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/product-image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000, // 30s por archivos grandes
    });

    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

// Obtener producto por ID (admin)
export const getProductById = async (productId: string) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

// Crear producto (admin)
export const createProduct = async (productData: ProductFormData) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post('/products', productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Actualizar producto (admin)
export const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.put(`/products/${productId}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
};

// Eliminar producto (admin)
export const deleteProduct = async (productId: string) => {
  try {
    const token = await getAuthToken();
    await apiClient.delete(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }
};
