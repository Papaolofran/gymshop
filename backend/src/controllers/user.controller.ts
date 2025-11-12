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

// GET /api/users/profile - Obtener perfil del usuario autenticado
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  const user = await userService.getUserByAuthId(req.user.id);

  res.json({
    success: true,
    data: user
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

// DELETE /api/users/:id - Eliminar usuario (admin)
// DELETE /api/users/delete-account/:id - Eliminar cuenta propia (usuario)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isSelfDelete = req.path.includes('/delete-account/');
  
  if (!req.user) {
    throw new ApiError(401, 'Usuario no autenticado');
  }

  try {
    // Verificar si es eliminación propia o admin
    if (isSelfDelete) {
      // Verificar que el usuario está eliminando su propia cuenta
      if (req.user.id !== id) {
        throw new ApiError(403, 'Solo puedes eliminar tu propia cuenta');
      }
      
      // Verificar que el usuario no sea admin
      const user = await userService.getUserByAuthId(id);
      if (user.role === 'admin') {
        throw new ApiError(403, 'Los administradores no pueden eliminar su propia cuenta');
      }
      
      // Proceder con la eliminación de la cuenta del usuario
      await userService.deleteOwnAccount(id);
      
      // Devolver respuesta exitosa, incluso si hubo problemas con auth
      // Lo importante es que los datos están anonimizados
      res.json({
        success: true,
        message: 'Tu cuenta ha sido eliminada correctamente',
      });
    } else {
      // Es una eliminación por parte de un admin (ya verificado por el middleware)
      const result = await userService.deleteUser(id);
      res.json({
        success: true,
        message: result.message
      });
    }
  } catch (error) {
    // Manejo especial para errores en la eliminación de cuenta
    console.error('Error en deleteUser controller:', error);
    
    // Si hubo algún error pero es de autenticación, probablemente los datos ya estén anonimizados
    // así que devolvemos un mensaje más optimista
    if (isSelfDelete && error instanceof ApiError && error.message.includes('credenciales')) {
      res.status(200).json({
        success: true,
        message: 'Tu cuenta ha sido eliminada, pero podría haber problemas con el cierre de sesión. Por favor, cierra sesión manualmente.',
        partialSuccess: true
      });
      return;
    }
    
    // Si es otro tipo de error, lo propagamos
    throw error;
  }
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
