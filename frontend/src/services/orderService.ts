import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interface para crear orden
export interface CreateOrderData {
  addressId: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
}

// Interface para orden
export interface Order {
  id: number;
  userId: string;
  addressId: string;
  totalAmount: number;
  status: string;
  deliveryDate?: string;
  shippingCost?: number;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: {
    id: string;
    variantId: string;
    quantity: number;
    price: number;
    variant: {
      id: string;
      price: number;
      color?: string | null;
      colorName?: string | null;
      size?: string | null;
      flavor?: string | null;
      weight?: string | null;
      product: {
        name: string;
        images: string[];
      };
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

// Obtener órdenes de un usuario
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    console.log(`Obteniendo órdenes para usuario ${userId}`);
    
    // Crear un cliente con más tiempo de espera para operaciones lentas
    const client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // 15 segundos para operaciones de listado
    });
    
    const response = await client.get(`/orders/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Respuesta de órdenes recibida');
    return response.data.data || [];
  } catch (error) {
    console.error(`Error al obtener órdenes del usuario ${userId}:`, error);
    
    // Convertir el error a un tipo más específico
    const err = error as {
      code?: string;
      response?: {
        status: number;
        data?: { message?: string };
      };
      message?: string;
    };
    
    // Mejorar mensaje de error
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
    } else if (err.response) {
      throw new Error(err.response.data?.message || `Error del servidor (${err.response.status})`);
    } else {
      throw new Error(err.message || 'Error al obtener órdenes');
    }
  }
};

// Obtener una orden específica
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    console.log(`Obteniendo detalles de orden ${orderId}`);
    
    // Crear un cliente con timeout mayor para operaciones de detalle
    const client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // 15 segundos
    });
    
    const response = await client.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Detalles de orden recibidos');
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener detalles de orden ${orderId}:`, error);
    
    // Convertir el error a un tipo más específico
    const err = error as {
      code?: string;
      response?: {
        status: number;
        data?: { message?: string };
      };
      message?: string;
    };
    
    // Mejorar mensaje de error
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
    } else if (err.response) {
      throw new Error(err.response.data?.message || `Error del servidor (${err.response.status})`);
    } else {
      throw new Error(err.message || 'Error al obtener detalles de la orden');
    }
  }
};

// Crear nueva orden
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const token = await getAuthToken();
  const response = await axios.post(`${API_URL}/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

// Actualizar estado de orden (solo admin)
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const token = await getAuthToken();
  await axios.put(
    `${API_URL}/orders/${orderId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Cancelar orden (usuario o admin)
export const cancelOrder = async (orderId: string): Promise<void> => {
  const token = await getAuthToken();
  try {
    await axios.put(
      `${API_URL}/orders/${orderId}/cancel`,
      {},  // No body needed as status is forced to 'cancelled' on the backend
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};
