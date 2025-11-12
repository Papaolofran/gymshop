import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos para direcciones de usuario
// Las direcciones dependen de un usuario (relación padre-hijo)
export class AddressRepository {
  // Obtener todas las direcciones de un usuario
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener una dirección específica
  async findById(id: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Crear nueva dirección
  async create(addressData: {
    user_id: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }) {
    const { data, error } = await supabase
      .from('addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar dirección
  async update(id: string, addressData: {
    address_line1?: string;
    address_line2?: string | null;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }) {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar dirección
  async delete(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
  
  // Verificar si una dirección está siendo utilizada por alguna orden
  async findOrdersByAddressId(addressId: string) {
    // Consulta para obtener órdenes que utilizan esta dirección
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('shipping_address_id', addressId);
    
    if (error) throw error;
    return data || [];
  }
  
  // Copiar datos de dirección a pedidos antes de eliminarla
  async copyAddressDataToOrders(addressId: string) {
    try {
      // 1. Obtener la dirección completa
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();
      
      if (addressError) throw addressError;
      if (!address) throw new Error('Dirección no encontrada');
      
      // 2. Obtener todos los pedidos que usan esta dirección
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('shipping_address_id', addressId);
      
      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return; // No hay pedidos que actualizar
      
      // 3. Crear un objeto con los datos de la dirección para guardar en cada pedido
      const addressData = {
        address_data: {
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          country: address.country,
          postal_code: address.postal_code,
          address_id: address.id // Guardamos referencia al ID original por si acaso
        },
        // Establecer shipping_address_id a null para eliminar la relación
        shipping_address_id: null
      };
      
      // 4. Actualizar cada pedido con los datos de la dirección
      for (const order of orders) {
        const { error: updateError } = await supabase
          .from('orders')
          .update(addressData)
          .eq('id', order.id);
        
        if (updateError) {
          console.error(`Error al actualizar el pedido ${order.id}:`, updateError);
          throw updateError;
        }
      }
      
      console.log(`Se han actualizado ${orders.length} pedidos con los datos de la dirección antes de eliminarla`);
      return true;
    } catch (error) {
      console.error('Error al copiar datos de dirección a pedidos:', error);
      throw error;
    }
  }

}
