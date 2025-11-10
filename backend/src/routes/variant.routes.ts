import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant
} from '../controllers/variant.controller.js';

// Router para variantes (se monta en /api/products/:productId/variants)
const router = Router({ mergeParams: true });

// Rutas de variantes
// Endpoints anidados bajo productos - las variantes dependen de un producto
// Solo admin puede crear, actualizar o eliminar

router.get('/', getVariantsByProduct);                                  // Listar variantes del producto
router.get('/:id', getVariantById);                                     // Obtener una variante
router.post('/', authenticate, authorize('admin'), createVariant);      // Crear variante (solo admin)
router.put('/:id', authenticate, authorize('admin'), updateVariant);    // Actualizar variante (solo admin)
router.delete('/:id', authenticate, authorize('admin'), deleteVariant); // Eliminar variante (solo admin)

export default router;
