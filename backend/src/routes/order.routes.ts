import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../controllers/order.controller.js';

const router = Router();

// Rutas de órdenes
// Endpoints para gestionar órdenes de compra
// Admin puede ver todas, usuarios solo las suyas

router.get('/', authenticate, authorize('admin'), getAllOrders);           // Listar todas (solo admin)
router.get('/:id', authenticate, getOrderById);                            // Obtener una orden
router.post('/', authenticate, createOrder);                               // Crear orden
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus); // Actualizar estado (solo admin)

// Ruta anidada para órdenes de usuario
router.get('/user/:userId', authenticate, getOrdersByUser);                // Órdenes de un usuario

export default router;
