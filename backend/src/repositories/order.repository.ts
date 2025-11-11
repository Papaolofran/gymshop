import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos para órdenes
// Gestiona tanto órdenes como items de orden
export class OrderRepository {
  // Obtener todas las órdenes (admin)
  async findAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        address:addresses(*),
        items:order_items(
          *,
          variant:variants(
            *,
            product:products(*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener órdenes de un usuario
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        items:order_items(
          *,
          variant:variants(
            *,
            product:products(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener una orden específica
  async findById(id: number) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        address:addresses(*),
        items:order_items(
          *,
          variant:variants(
            *,
            product:products(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Crear nueva orden
  async create(orderData: {
    user_id: string;
    direction_id: string;
    delivery_date: string;
    shipping_cost: number;
    state?: string;
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar estado de orden
  async updateStatus(id: number, state: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ state })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Crear items de orden
  async createOrderItems(items: Array<{
    order_id: number;
    variant_id: string;
    quantity: number;
    price: number;
  }>) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data;
  }

  // Obtener items de una orden
  async findItemsByOrderId(orderId: number) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        variant:variants(
          *,
          product:products(*)
        )
      `)
      .eq('order_id', orderId);

    if (error) throw error;
    return data;
  }
}
