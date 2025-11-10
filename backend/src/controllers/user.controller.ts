import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { UserService } from '../services/user.service.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Controller: Capa que recibe peticiones HTTP
// Extrae datos de la request y llama al service correspondiente
const userService = new UserService();

// GET /api/users - Listar todos los usuarios (solo admin)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const users = await userService.getAllUsers();

  res.json({
    success: true,
    data: users
  });
};

// GET /api/users/:id - Obtener un usuario por ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  res.json({
    success: true,
    data: user
  });
};

// PUT /api/users/:id - Actualizar datos del usuario
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, phone, email } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const updatedUser = await userService.updateUser(id, req.user.id, {
    fullName,
    phone,
    email
  });

  res.json({
    success: true,
    message: 'Usuario actualizado correctamente',
    data: updatedUser
  });
};

// DELETE /api/users/:id - Eliminar usuario (solo admin)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await userService.deleteUser(id);

  res.json({
    success: true,
    message: result.message
  });
};

// PUT /api/users/:userId/role - Cambiar rol del usuario (solo admin)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, 'El rol es requerido');
  }

  const result = await userService.updateUserRole(userId, role);

  res.json({
    success: true,
    message: result.message,
    data: { role: result.role }
  });
};
