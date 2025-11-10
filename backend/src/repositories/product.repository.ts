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
    if (offset) query = query.range(offset, offset + limit - 1);

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
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
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
      .eq('is_featured', true)
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
}
