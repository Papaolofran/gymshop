import { VariantRepository } from '../repositories/variant.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interface para variante de BD
interface VariantFromDB {
  id: string;
  product_id: string;
  price: number;
  stock: number;
  color?: string | null;
  color_name?: string | null;
  size?: string | null;
  flavor?: string | null;
  weight?: string | null;
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
    price: number;
    stock: number;
    color?: string;
    colorName?: string;
    size?: string;
    flavor?: string;
    weight?: string;
  }) {
    try {
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      const variant = await this.variantRepository.create({
        product_id: productId,
        price: variantData.price,
        stock: variantData.stock,
        color: variantData.color,
        color_name: variantData.colorName,
        size: variantData.size,
        flavor: variantData.flavor,
        weight: variantData.weight
      });

      return this.transformVariant(variant);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al crear variante');
    }
  }

  // Actualizar variante (solo admin)
  async updateVariant(id: string, productId: string, variantData: {
    price?: number;
    stock?: number;
    color?: string;
    colorName?: string;
    size?: string;
    flavor?: string;
    weight?: string;
  }) {
    try {
      const variant = await this.variantRepository.findById(id);

      if (!variant) {
        throw new ApiError(404, 'Variante no encontrada');
      }

      if (variant.product_id !== productId) {
        throw new ApiError(400, 'La variante no pertenece a este producto');
      }

      const updateData: {
        price?: number;
        stock?: number;
        color?: string;
        color_name?: string;
        size?: string;
        flavor?: string;
        weight?: string;
      } = {};

      if (variantData.price !== undefined) updateData.price = variantData.price;
      if (variantData.stock !== undefined) updateData.stock = variantData.stock;
      if (variantData.color !== undefined) updateData.color = variantData.color;
      if (variantData.colorName !== undefined) updateData.color_name = variantData.colorName;
      if (variantData.size !== undefined) updateData.size = variantData.size;
      if (variantData.flavor !== undefined) updateData.flavor = variantData.flavor;
      if (variantData.weight !== undefined) updateData.weight = variantData.weight;

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
      price: variant.price,
      stock: variant.stock,
      color: variant.color,
      colorName: variant.color_name,
      size: variant.size,
      flavor: variant.flavor,
      weight: variant.weight
    };
  }
}
