import { supabase } from '../config/database.js';

// Repository: Capa de acceso a datos
// Solo ejecuta consultas a la base de datos, sin lógica de negocio
export class UserRepository {
  // Obtener todos los usuarios con sus roles
  async findAll() {
    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Obtener todos los roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) throw rolesError;

    // Combinar usuarios con sus roles
    return users.map(user => ({
      ...user,
      user_roles: roles?.filter(r => r.user_id === user.user_id) || []
    }));
  }

  // Buscar usuario por ID de tabla users
  async findById(id: string) {
    // Primero obtener el usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) throw userError;

    // Luego obtener el rol
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user_id)
      .single();

    if (roleError) {
      console.warn('No role found for user:', userData.user_id);
    }

    return {
      ...userData,
      user_roles: roleData ? [roleData] : []
    };
  }

  // Buscar usuario por user_id de Supabase Auth
  async findByUserId(userId: string) {
    // Primero obtener el usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    // Luego obtener el rol
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      // Si no hay rol, continuar con rol por defecto
      console.warn('No role found for user:', userId);
    }

    return {
      ...userData,
      user_roles: roleData ? [roleData] : []
    };
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
