import { ProductRepository } from '../repositories/product.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interfaces para tipado
interface Variant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFromDB {
  id: string;
  name: string;
  slug: string;
  features: string[];
  brand: string;
  images: string[];
  highlighted: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: Variant[];
}

// Service: Capa de lógica de negocio para productos
// Transforma datos y coordina operaciones del repository
export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  // Obtener todos los productos con paginación opcional
  async getAllProducts(page?: number, limit: number = 12) {
    try {
      const offset = page ? (page - 1) * limit : 0;
      const products = await this.productRepository.findAll(limit, offset);
      const total = await this.productRepository.count();

      return {
        products: products.map((p) => this.transformProduct(p)),
        pagination: {
          page: page || 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch {
      throw new ApiError(500, 'Error al obtener productos');
    }
  }

  // Obtener un producto por ID
  async getProductById(id: string) {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      return this.transformProduct(product);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener producto');
    }
  }

  // Obtener un producto por slug
  async getProductBySlug(slug: string) {
    try {
      const product = await this.productRepository.findBySlug(slug);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      return this.transformProduct(product);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener producto');
    }
  }

  // Buscar productos por término
  async searchProducts(searchTerm: string) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new ApiError(400, 'El término de búsqueda debe tener al menos 2 caracteres');
      }

      const products = await this.productRepository.search(searchTerm);

      return products.map((p) => this.transformProduct(p));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al buscar productos');
    }
  }

  // Filtrar productos por categoría y/o marca
  async filterProducts(categoryId?: string, brand?: string) {
    try {
      const products = await this.productRepository.filter(categoryId, brand);

      return products.map((p) => this.transformProduct(p));
    } catch {
      throw new ApiError(500, 'Error al filtrar productos');
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts() {
    try {
      const products = await this.productRepository.findFeatured();

      return products.map((p) => this.transformProduct(p));
    } catch {
      throw new ApiError(500, 'Error al obtener productos destacados');
    }
  }

  // Crear nuevo producto (solo admin)
  async createProduct(productData: {
    name: string;
    slug: string;
    description: string;
    brand: string;
    basePrice: number;
    categoryId: string;
    images: string[];
    isFeatured?: boolean;
  }) {
    try {
      // Convertir description (string) en features (array)
      const features = productData.description
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const product = await this.productRepository.create({
        name: productData.name,
        slug: productData.slug,
        features: features,
        brand: productData.brand,
        category_id: productData.categoryId,
        images: productData.images,
        highlighted: productData.isFeatured || false
      });

      return this.transformProduct(product);
    } catch {
      throw new ApiError(500, 'Error al crear producto');
    }
  }

  // Actualizar producto (solo admin)
  async updateProduct(id: string, productData: {
    name?: string;
    slug?: string;
    description?: string;
    brand?: string;
    basePrice?: number;
    categoryId?: string;
    images?: string[];
    isFeatured?: boolean;
  }) {
    try {
      const existingProduct = await this.productRepository.findById(id);

      if (!existingProduct) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      const updateData: {
        name?: string;
        slug?: string;
        features?: string[];
        brand?: string;
        category_id?: string;
        images?: string[];
        highlighted?: boolean;
      } = {};

      if (productData.name) updateData.name = productData.name;
      if (productData.slug) updateData.slug = productData.slug;
      if (productData.description) {
        // Convertir description (string) en features (array)
        updateData.features = productData.description
          .split('\n')
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }
      if (productData.brand) updateData.brand = productData.brand;
      if (productData.categoryId) updateData.category_id = productData.categoryId;
      if (productData.images) updateData.images = productData.images;
      if (productData.isFeatured !== undefined) updateData.highlighted = productData.isFeatured;

      const updatedProduct = await this.productRepository.update(id, updateData);

      return this.transformProduct(updatedProduct);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar producto');
    }
  }

  // Eliminar producto (solo admin)
  async deleteProduct(id: string) {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        throw new ApiError(404, 'Producto no encontrado');
      }

      await this.productRepository.delete(id);

      return { message: 'Producto eliminado correctamente' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al eliminar producto');
    }
  }

  // Transformar producto de BD a formato del frontend
  private transformProduct(product: ProductFromDB) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.features.join('\n'), // Convertir array a string
      brand: product.brand,
      basePrice: product.variants && product.variants.length > 0 ? product.variants[0].price : 0,
      images: product.images,
      isFeatured: product.highlighted,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      } : null,
      variants: product.variants?.map((v: Variant) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        attributes: v.attributes,
        price: v.price,
        stock: v.stock,
        isActive: v.is_active
      })) || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }
}
