import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAddressesByUser,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/address.controller.js';

// Router para direcciones (se monta en /api/users/:userId/addresses)
const router = Router({ mergeParams: true });

// Rutas de direcciones
// Endpoints anidados bajo usuarios - las direcciones dependen de un usuario
// El usuario solo puede gestionar sus propias direcciones

router.get('/', authenticate, getAddressesByUser);     // Listar direcciones del usuario
router.get('/:id', authenticate, getAddressById);      // Obtener una dirección
router.post('/', authenticate, createAddress);         // Crear dirección
router.put('/:id', authenticate, updateAddress);       // Actualizar dirección
router.delete('/:id', authenticate, deleteAddress);    // Eliminar dirección

export default router;
