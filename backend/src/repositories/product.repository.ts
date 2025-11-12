import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos para productos
// Ejecuta consultas a la base de datos sin lógica de negocio
export class ProductRepository {
  // Obtener todos los productos con sus variantes y categoría
  async findAll(limit?: number, offset?: number) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);
    if (offset && limit) query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Buscar producto por slug
  async findBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar producto por ID
  async findById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar productos por término de búsqueda
  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Filtrar productos por categoría y/o marca
  async filter(categoryId?: string, brand?: string) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Obtener productos destacados
  async findFeatured() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants(*)
      `)
      .eq('highlighted', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Contar total de productos
  async count() {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  // Crear nuevo producto
  async create(productData: {
    name: string;
    slug: string;
    features: string[];
    brand: string;
    category_id: string;
    images: string[];
    highlighted?: boolean;
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar producto
  async update(id: string, productData: {
    name?: string;
    slug?: string;
    features?: string[];
    brand?: string;
    category_id?: string;
    images?: string[];
    highlighted?: boolean;
  }) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar producto y todas sus variantes
  async delete(id: string) {
    // 1. Primero verificamos si el producto existe
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (findError) {
      console.error('Error al buscar producto:', findError);
      throw findError;
    }

    if (!product) {
      console.error('Producto no encontrado con ID:', id);
      throw new Error('Producto no encontrado');
    }

    try {
      // 2. Eliminamos todas las variantes del producto primero
      console.log(`Eliminando variantes del producto ${id}...`);
      const { error: variantsError } = await supabase
        .from('variants')
        .delete()
        .eq('product_id', id);

      if (variantsError) {
        console.error('Error al eliminar variantes:', variantsError);
        throw variantsError;
      }

      // 3. Luego eliminamos el producto
      console.log(`Eliminando producto ${id}...`);
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (productError) {
        console.error('Error al eliminar producto:', productError);
        throw productError;
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar producto y sus variantes:', error);
      throw error;
    }
  }
}
