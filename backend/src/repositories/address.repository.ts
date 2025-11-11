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

}
