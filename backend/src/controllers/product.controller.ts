import type { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';

// Controller: Capa que recibe peticiones HTTP de productos
// Extrae parámetros y query strings, llama al service
const productService = new ProductService();

// GET /api/products - Listar todos los productos con paginación
export const getAllProducts = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

  const result = await productService.getAllProducts(page, limit);

  res.json({
    success: true,
    data: result.products,
    pagination: result.pagination
  });
};

// GET /api/products/slug/:slug - Obtener producto por slug
export const getProductBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await productService.getProductBySlug(slug);

  res.json({
    success: true,
    data: product
  });
};

// GET /api/products/search?q=termino - Buscar productos
export const searchProducts = async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  const products = await productService.searchProducts(searchTerm);

  res.json({
    success: true,
    data: products,
    count: products.length
  });
};

// GET /api/products/filter?category=id&brand=nombre - Filtrar productos
export const filterProducts = async (req: Request, res: Response) => {
  const categoryId = req.query.category as string | undefined;
  const brand = req.query.brand as string | undefined;

  const products = await productService.filterProducts(categoryId, brand);

  res.json({
    success: true,
    data: products,
    count: products.length
  });
};

// GET /api/products/featured - Obtener productos destacados
export const getFeaturedProducts = async (req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts();

  res.json({
    success: true,
    data: products
  });
};
