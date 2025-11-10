import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  searchProducts,
  filterProducts,
  getFeaturedProducts
} from '../controllers/product.controller.js';

const router = Router();

// Rutas de productos
// Endpoints públicos para consultar el catálogo

router.get('/', getAllProducts);                    // Listar con paginación
router.get('/search', searchProducts);              // Buscar por término
router.get('/filter', filterProducts);              // Filtrar por categoría/marca
router.get('/featured', getFeaturedProducts);       // Productos destacados
router.get('/slug/:slug', getProductBySlug);        // Obtener por slug

export default router;
