import { VariantRepository } from '../repositories/variant.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interface para variante de BD
interface VariantFromDB {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service: Capa de lógica de negocio para variantes
// Valida que el producto exista antes de operar con variantes
export class VariantService {
  private variantRepository: VariantRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.variantRepository = new VariantRepository();
    this.productRepository = new ProductRepository();
  }

  // Obtener todas las variantes de un producto
  async getVariantsByProduct(productId: string) {
    try {
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      const variants = await this.variantRepository.findByProductId(productId);

      return variants.map(this.transformVariant);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener variantes');
    }
  }

  // Obtener una variante específica
  async getVariantById(id: string, productId: string) {
    try {
      const variant = await this.variantRepository.findById(id);

      if (!variant) {
        throw new ApiError(404, 'Variante no encontrada');
      }

      if (variant.product_id !== productId) {
        throw new ApiError(400, 'La variante no pertenece a este producto');
      }

      return this.transformVariant(variant);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener variante');
    }
  }

  // Crear nueva variante (solo admin)
  async createVariant(productId: string, variantData: {
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    isActive?: boolean;
  }) {
    try {
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      const existingSku = await this.variantRepository.findBySku(variantData.sku);

      if (existingSku) {
        throw new ApiError(400, 'Ya existe una variante con este SKU');
      }

      const variant = await this.variantRepository.create({
        product_id: productId,
        sku: variantData.sku,
        attributes: variantData.attributes,
        price: variantData.price,
        stock: variantData.stock,
        is_active: variantData.isActive ?? true
      });

      return this.transformVariant(variant);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al crear variante');
    }
  }

  // Actualizar variante (solo admin)
  async updateVariant(id: string, productId: string, variantData: {
    sku?: string;
    attributes?: Record<string, string>;
    price?: number;
    stock?: number;
    isActive?: boolean;
  }) {
    try {
      const variant = await this.variantRepository.findById(id);

      if (!variant) {
        throw new ApiError(404, 'Variante no encontrada');
      }

      if (variant.product_id !== productId) {
        throw new ApiError(400, 'La variante no pertenece a este producto');
      }

      if (variantData.sku && variantData.sku !== variant.sku) {
        const existingSku = await this.variantRepository.findBySku(variantData.sku);
        
        if (existingSku) {
          throw new ApiError(400, 'Ya existe una variante con este SKU');
        }
      }

      const updateData: {
        sku?: string;
        attributes?: Record<string, string>;
        price?: number;
        stock?: number;
        is_active?: boolean;
      } = {};

      if (variantData.sku) updateData.sku = variantData.sku;
      if (variantData.attributes) updateData.attributes = variantData.attributes;
      if (variantData.price !== undefined) updateData.price = variantData.price;
      if (variantData.stock !== undefined) updateData.stock = variantData.stock;
      if (variantData.isActive !== undefined) updateData.is_active = variantData.isActive;

      const updatedVariant = await this.variantRepository.update(id, updateData);

      return this.transformVariant(updatedVariant);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar variante');
    }
  }

  // Eliminar variante (solo admin)
  async deleteVariant(id: string, productId: string) {
    try {
      const variant = await this.variantRepository.findById(id);

      if (!variant) {
        throw new ApiError(404, 'Variante no encontrada');
      }

      if (variant.product_id !== productId) {
        throw new ApiError(400, 'La variante no pertenece a este producto');
      }

      await this.variantRepository.delete(id);

      return { message: 'Variante eliminada correctamente' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al eliminar variante');
    }
  }

  // Transformar variante de BD a formato del frontend
  private transformVariant(variant: VariantFromDB) {
    return {
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      attributes: variant.attributes,
      price: variant.price,
      stock: variant.stock,
      isActive: variant.is_active,
      createdAt: variant.created_at,
      updatedAt: variant.updated_at
    };
  }
}
