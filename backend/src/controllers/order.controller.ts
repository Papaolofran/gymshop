import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { OrderService } from '../services/order.service.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { Request } from 'express';

// Controller: Capa que recibe peticiones HTTP de órdenes
// Gestiona la creación y consulta de órdenes de compra
const orderService = new OrderService();

// GET /api/orders - Listar todas las órdenes (solo admin)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getAllOrders();

  res.json({
    success: true,
    data: orders
  });
};

// GET /api/users/:userId/orders - Listar órdenes de un usuario
export const getOrdersByUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const isAdmin = req.user.role === 'admin';
  const orders = await orderService.getOrdersByUser(userId, req.user.id, isAdmin);

  res.json({
    success: true,
    data: orders
  });
};

// GET /api/orders/:id - Obtener orden específica
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrderById(parseInt(id), req.user.id, isAdmin);

  res.json({
    success: true,
    data: order
  });
};

// POST /api/orders - Crear nueva orden
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { addressId, items } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  if (!addressId || !items) {
    throw new ApiError(400, 'Dirección e items son requeridos');
  }

  try {
    const order = await orderService.createOrder(req.user.id, {
      addressId,
      items
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada correctamente',
      data: order
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    res.status(500).json({
      success: false,
      message: 'Error interno al crear la orden'
    });
  }
};

// --- MERCADO PAGO INTEGRATION ---
// POST /api/orders/preference - Crear la preferencia en MercadoPago
export const createPaymentPreference = async (req: AuthRequest, res: Response) => {
  const { addressId, items } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  try {
    const preference = await orderService.createPaymentPreference(req.user.id, {
      addressId,
      items
    });

    res.status(200).json({
      success: true,
      data: preference
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    res.status(500).json({
      success: false,
      message: 'Error al generar la preferencia de pago'
    });
  }
};

// POST /api/orders/webhook - Recibe notificaciones de MP
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    // MP envía topic y id o type y data.id
    const { type, 'data.id': dataId, topic, id } = req.query;

    const action = type || topic;
    const paymentId = (dataId || id) as string;

    if (action === 'payment' && paymentId) {
       await orderService.processMercadoPagoWebhook(paymentId);
    }

    // MercadoPago requiere que siempre devuelvas 200 OK
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // Return 200 anyway so MP doesn't retry infinitely and crash server unless we really need retry
    res.status(200).send('OK');
  }
};

// GET /api/orders/verify-payment/:paymentId - Verificación manual por el frontend (fallback dev)
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { paymentId } = req.params;
  try {
    const result = await orderService.processMercadoPagoWebhook(paymentId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in manual payment verification:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof ApiError ? error.message : 'Error al verificar pago' 
    });
  }
};
// --- FIN MERCADOPAGO ---

// PUT /api/orders/:id/status - Actualizar estado de orden (admin)
// PUT /api/orders/:id/cancel - Cancelar orden (usuario o admin)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // Si la ruta es /cancel, forzar el estado a 'cancelled'
  const isCancelRoute = req.path.endsWith('/cancel');
  const status = isCancelRoute ? 'cancelled' : req.body.status;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  if (!status) {
    throw new ApiError(400, 'El estado es requerido');
  }
  
  // Si no es admin y no es la ruta de cancelación, error
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && !isCancelRoute) {
    throw new ApiError(403, 'No tienes permisos para actualizar el estado de esta orden');
  }
  
  // Si no es admin y es la ruta de cancelación, verificar que la orden pertenece al usuario
  if (!isAdmin && isCancelRoute) {
    // Verificar que la orden existe y pertenece al usuario
    // La verificación de permisos se hace en getOrderById
    // Si la orden no pertenece al usuario, getOrderById lanzará un error
    await orderService.getOrderById(parseInt(id), req.user.id, false);
  }

  const result = await orderService.updateOrderStatus(parseInt(id), status);

  res.json({
    success: true,
    message: isCancelRoute ? 'Orden cancelada correctamente' : result.message,
    data: { status: result.status }
  });
};
