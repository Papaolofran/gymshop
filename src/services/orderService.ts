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
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

// Obtener una orden específica
export const getOrderById = async (orderId: string): Promise<Order> => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
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
