import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';
import type { 
  Order, 
  CreateOrderData, 
  PaymentPreferenceResponse, 
  VerifyPaymentResponse 
} from '../interfaces/order.interface';

const API_URL = import.meta.env.VITE_API_URL;

// Cliente centralizado para evitar repetición de configuración
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'bypass-tunnel-reminder': 'true'
  }
});

// Helper para configurar headers de autenticación
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    Authorization: `Bearer ${token}`
  };
};


// Obtener todas las órdenes (solo admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await apiClient.get('/orders', { headers });
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener todas las órdenes:', error);
    throw error;
  }
};

// Obtener órdenes de un usuario
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await apiClient.get(`/orders/user/${userId}`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error(`Error al obtener órdenes del usuario ${userId}:`, error);
    throw error;
  }
};

// Obtener una orden específica
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const headers = await getAuthHeaders();
    const response = await apiClient.get(`/orders/${orderId}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener detalles de orden ${orderId}:`, error);
    throw error;
  }
};

// Crear nueva orden
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const headers = await getAuthHeaders();
  const response = await apiClient.post('/orders', orderData, { headers });
  return response.data.data;
};

// Checkout con Mercado Pago (Obtener Preferencia)
export const createPaymentPreference = async (orderData: CreateOrderData): Promise<PaymentPreferenceResponse> => {
  const headers = await getAuthHeaders();
  console.log('Enviando solicitud de preferencia de pago...');
  const response = await apiClient.post('/orders/preference', orderData, { headers });
  return response.data.data;
};

// Verificar pago de Mercado Pago
export const verifyPayment = async (paymentId: string): Promise<VerifyPaymentResponse> => {
  const headers = await getAuthHeaders();
  const response = await apiClient.get(`/orders/verify-payment/${paymentId}`, { headers });
  return response.data;
};

// Actualizar estado de orden (solo admin)
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await apiClient.put(`/orders/${orderId}/status`, { status }, { headers });
};

// Cancelar orden (usuario o admin)
export const cancelOrder = async (orderId: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await apiClient.put(`/orders/${orderId}/cancel`, {}, { headers });
};
