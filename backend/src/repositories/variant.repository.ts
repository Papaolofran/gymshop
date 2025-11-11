import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos para variantes de productos
// Las variantes dependen de un producto (relación padre-hijo)
export class VariantRepository {
  // Obtener todas las variantes de un producto
  async findByProductId(productId: string) {
    const { data, error } = await supabase
      .from('variants')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  // Obtener una variante específica
  async findById(id: string) {
    const { data, error } = await supabase
      .from('variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Crear nueva variante
  async create(variantData: {
    product_id: string;
    price: number;
    stock: number;
    color?: string;
    color_name?: string;
    size?: string;
    flavor?: string;
    weight?: string;
  }) {
    const { data, error } = await supabase
      .from('variants')
      .insert(variantData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar variante
  async update(id: string, variantData: {
    price?: number;
    stock?: number;
    color?: string;
    color_name?: string;
    size?: string;
    flavor?: string;
    weight?: string;
  }) {
    const { data, error} = await supabase
      .from('variants')
      .update(variantData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar variante
  async delete(id: string) {
    const { error } = await supabase
      .from('variants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Actualizar stock de una variante
  async updateStock(id: string, newStock: number) {
    const { data, error } = await supabase
      .from('variants')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
