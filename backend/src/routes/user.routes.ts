import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole
} from '../controllers/user.controller.js';
import addressRoutes from './address.routes.js';

const router = Router();

// Rutas de usuarios
// authenticate: verifica que el usuario esté autenticado
// authorize: verifica que el usuario tenga el rol necesario

router.get('/', authenticate, authorize('admin'), getAllUsers);               // Listar todos (solo admin)
router.get('/:id', authenticate, getUserById);                                // Obtener uno
router.put('/:id', authenticate, updateUser);                                 // Actualizar perfil
router.delete('/:id', authenticate, authorize('admin'), deleteUser);          // Eliminar (solo admin)
router.put('/:userId/role', authenticate, authorize('admin'), updateUserRole);// Cambiar rol (solo admin)

// Rutas anidadas de direcciones
router.use('/:userId/addresses', addressRoutes);                              // Direcciones del usuario

export default router;
