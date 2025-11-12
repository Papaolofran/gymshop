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

  // Obtener el rol de un usuario por user_id
  async findRoleByUserId(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('No role found for user:', userId);
      return null;
    }

    return data;
  }

  // Anonimizar un usuario (conservar ID pero eliminar datos personales)
  async anonymizeUser(id: string, anonymizedData: {
    full_name: string;
    email: string;
    phone: null;
  }) {
    const { data, error } = await supabase
      .from('users')
      .update(anonymizedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  
  // MÉTODOS PARA ELIMINACIÓN COMPLETA DE DATOS
  
  // 1. Eliminar todas las direcciones del usuario
  async deleteUserAddresses(userId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al eliminar direcciones:', error);
      throw error;
    }
    return true;
  }
  
  // 2. Eliminar pagos relacionados con órdenes del usuario
  async deleteUserPayments(userId: string) {
    // Primero obtenemos los IDs de las órdenes del usuario
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId);
    
    if (ordersError) {
      console.error('Error al obtener órdenes para eliminar pagos:', ordersError);
      throw ordersError;
    }
    
    // Si no hay órdenes, no hay nada que hacer
    if (!orders || orders.length === 0) {
      return true;
    }
    
    // Eliminar pagos para cada orden
    const orderIds = orders.map(order => order.id);
    
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .in('order_id', orderIds);
    
    if (paymentsError) {
      console.error('Error al eliminar pagos:', paymentsError);
      throw paymentsError;
    }
    
    return true;
  }
  
  // 3. Eliminar órdenes y detalles de órdenes del usuario
  async deleteUserOrders(userId: string) {
    // Primero obtenemos los IDs de las órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId);
    
    if (ordersError) {
      console.error('Error al obtener órdenes:', ordersError);
      throw ordersError;
    }
    
    // Si hay órdenes, eliminar primero los detalles
    if (orders && orders.length > 0) {
      const orderIds = orders.map(order => order.id);
      
      // Eliminar detalles de órdenes
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);
      
      if (orderItemsError) {
        console.error('Error al eliminar detalles de órdenes:', orderItemsError);
        throw orderItemsError;
      }
    }
    
    // Eliminar las órdenes
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al eliminar órdenes:', error);
      throw error;
    }
    
    return true;
  }
  
  // 4. Eliminar el rol del usuario
  async deleteUserRole(userId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al eliminar rol de usuario:', error);
      throw error;
    }
    
    return true;
  }
  
  // 5. Eliminar el registro del usuario
  async deleteUserRecord(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error al eliminar registro de usuario:', error);
      throw error;
    }
    
    return true;
  }
}
