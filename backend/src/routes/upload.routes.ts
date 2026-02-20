import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadProductImage, deleteProductImage } from '../controllers/upload.controller.js';

const router = Router();

// POST /api/upload/product-image - Subir imagen de producto (solo admin)
router.post('/product-image', authenticate, authorize('admin'), uploadProductImage);

// DELETE /api/upload/product-image - Eliminar imagen de producto (solo admin)
router.delete('/product-image', authenticate, authorize('admin'), deleteProductImage);

export default router;
