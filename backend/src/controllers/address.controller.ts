import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { AddressService } from '../services/address.service.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Controller: Capa que recibe peticiones HTTP de direcciones
// Maneja endpoints anidados bajo usuarios (/api/users/:userId/addresses)
const addressService = new AddressService();

// GET /api/users/:userId/addresses - Listar direcciones de un usuario
export const getAddressesByUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const addresses = await addressService.getAddressesByUser(userId, req.user.id);

  res.json({
    success: true,
    data: addresses
  });
};

// GET /api/users/:userId/addresses/:id - Obtener dirección específica
export const getAddressById = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const address = await addressService.getAddressById(id, userId, req.user.id);

  res.json({
    success: true,
    data: address
  });
};

// POST /api/users/:userId/addresses - Crear dirección
export const createAddress = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { street, city, state, postalCode, country, isDefault } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const address = await addressService.createAddress(userId, req.user.id, {
    street,
    city,
    state,
    postalCode,
    country,
    isDefault
  });

  res.status(201).json({
    success: true,
    message: 'Dirección creada correctamente',
    data: address
  });
};

// PUT /api/users/:userId/addresses/:id - Actualizar dirección
export const updateAddress = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;
  const { street, city, state, postalCode, country, isDefault } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const address = await addressService.updateAddress(id, userId, req.user.id, {
    street,
    city,
    state,
    postalCode,
    country,
    isDefault
  });

  res.json({
    success: true,
    message: 'Dirección actualizada correctamente',
    data: address
  });
};

// DELETE /api/users/:userId/addresses/:id - Eliminar dirección
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { userId, id } = req.params;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const result = await addressService.deleteAddress(id, userId, req.user.id);

  res.json({
    success: true,
    message: result.message
  });
};
