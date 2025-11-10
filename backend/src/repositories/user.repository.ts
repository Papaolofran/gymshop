import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos
// Solo ejecuta consultas a la base de datos, sin lógica de negocio
export class UserRepository {
  // Obtener todos los usuarios con sus roles
  async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Buscar usuario por ID de tabla users
  async findById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar usuario por user_id de Supabase Auth
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role)')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar datos del usuario
  async update(id: string, userData: {
    full_name?: string;
    phone?: string;
    email?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar usuario
  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Actualizar rol del usuario en la tabla user_roles
  async updateRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
