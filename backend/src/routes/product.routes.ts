import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllProducts,
  getProductBySlug,
  searchProducts,
  filterProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';

const router = Router();

// Rutas de productos
// Endpoints públicos para consultar el catálogo
// Endpoints protegidos para administración (solo admin)

router.get('/', getAllProducts);                                        // Listar con paginación
router.get('/search', searchProducts);                                  // Buscar por término
router.get('/filter', filterProducts);                                  // Filtrar por categoría/marca
router.get('/featured', getFeaturedProducts);                           // Productos destacados
router.get('/slug/:slug', getProductBySlug);                            // Obtener por slug

router.post('/', authenticate, authorize('admin'), createProduct);      // Crear producto (solo admin)
router.put('/:id', authenticate, authorize('admin'), updateProduct);    // Actualizar producto (solo admin)
router.delete('/:id', authenticate, authorize('admin'), deleteProduct); // Eliminar producto (solo admin)

export default router;
