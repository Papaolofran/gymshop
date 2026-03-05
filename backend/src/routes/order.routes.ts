import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  createOrder,
  createPaymentPreference,
  handlePaymentWebhook,
  verifyPayment,
  updateOrderStatus
} from '../controllers/order.controller.js';

const router = Router();

// Rutas de órdenes
// Endpoints para gestionar órdenes de compra
// Admin puede ver todas, usuarios solo las suyas

router.get('/', authenticate, authorize('admin'), getAllOrders);           // Listar todas (solo admin)

// IMPORTANTE: Las rutas específicas deben ir ANTES de las genéricas para evitar conflictos
// Ruta anidada para órdenes de usuario
router.get('/user/:userId', authenticate, getOrdersByUser);                // Órdenes de un usuario

// Integración con MercadoPago
router.post('/preference', authenticate, createPaymentPreference);
router.post('/webhook', handlePaymentWebhook); // El webhook no usa authenticate porque viene de MP
router.get('/verify-payment/:paymentId', authenticate, verifyPayment); // Verificación manual desde frontend (fallback dev)

// Rutas genéricas con parámetros
router.get('/:id', authenticate, getOrderById);                            // Obtener una orden
router.post('/', authenticate, createOrder);                               // Crear orden (alternativa manual)
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus); // Actualizar estado (solo admin)
router.put('/:id/cancel', authenticate, updateOrderStatus);               // Cancelar orden (usuario o admin)

export default router;
