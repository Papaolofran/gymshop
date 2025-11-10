import type { Request, Response } from 'express';
import { VariantService } from '../services/variant.service.js';

// Controller: Capa que recibe peticiones HTTP de variantes
// Maneja endpoints anidados bajo productos (/api/products/:productId/variants)
const variantService = new VariantService();

// GET /api/products/:productId/variants - Listar variantes de un producto
export const getVariantsByProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const variants = await variantService.getVariantsByProduct(productId);

  res.json({
    success: true,
    data: variants
  });
};

// GET /api/products/:productId/variants/:id - Obtener variante específica
export const getVariantById = async (req: Request, res: Response) => {
  const { productId, id } = req.params;

  const variant = await variantService.getVariantById(id, productId);

  res.json({
    success: true,
    data: variant
  });
};

// POST /api/products/:productId/variants - Crear variante (solo admin)
export const createVariant = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { sku, attributes, price, stock, isActive } = req.body;

  const variant = await variantService.createVariant(productId, {
    sku,
    attributes,
    price,
    stock,
    isActive
  });

  res.status(201).json({
    success: true,
    message: 'Variante creada correctamente',
    data: variant
  });
};

// PUT /api/products/:productId/variants/:id - Actualizar variante (solo admin)
export const updateVariant = async (req: Request, res: Response) => {
  const { productId, id } = req.params;
  const { sku, attributes, price, stock, isActive } = req.body;

  const variant = await variantService.updateVariant(id, productId, {
    sku,
    attributes,
    price,
    stock,
    isActive
  });

  res.json({
    success: true,
    message: 'Variante actualizada correctamente',
    data: variant
  });
};

// DELETE /api/products/:productId/variants/:id - Eliminar variante (solo admin)
export const deleteVariant = async (req: Request, res: Response) => {
  const { productId, id } = req.params;

  const result = await variantService.deleteVariant(id, productId);

  res.json({
    success: true,
    message: result.message
  });
};
