import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Service: Capa de lógica de negocio
// Contiene validaciones, transformaciones y coordina operaciones del repository
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Obtener todos los usuarios (solo admin)
  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll();
      
      return users.map(user => ({
        id: user.id,
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.user_roles?.[0]?.role || 'customer',
        createdAt: user.created_at
      }));
    } catch {
      throw new ApiError(500, 'Error al obtener usuarios');
    }
  }

  // Obtener un usuario por ID
  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      return {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.user_roles?.[0]?.role || 'customer',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener usuario');
    }
  }

  // Obtener un usuario por user_id de Supabase Auth
  async getUserByAuthId(userId: string) {
    try {
      const user = await this.userRepository.findByUserId(userId);

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      return {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.user_roles?.[0]?.role || 'customer',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener usuario');
    }
  }

  // Actualizar datos del usuario
  // Solo puede actualizar su propio perfil
  async updateUser(id: string, userId: string, updateData: {
    fullName?: string;
    phone?: string;
    email?: string;
  }) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      if (user.user_id !== userId) {
        throw new ApiError(403, 'No tienes permisos para actualizar este usuario');
      }

      const userData: {
        full_name?: string;
        phone?: string;
        email?: string;
      } = {};
      if (updateData.fullName) userData.full_name = updateData.fullName;
      if (updateData.phone) userData.phone = updateData.phone;
      if (updateData.email) userData.email = updateData.email;

      const updatedUser = await this.userRepository.update(id, userData);

      return {
        id: updatedUser.id,
        userId: updatedUser.user_id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phone: updatedUser.phone,
        updatedAt: updatedUser.updated_at
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar usuario');
    }
  }

  // Eliminar usuario (solo admin)
  async deleteUser(id: string) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      await this.userRepository.delete(id);

      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al eliminar usuario');
    }
  }
  
  // Método para que un usuario elimine su propia cuenta - ELIMINACIÓN COMPLETA
  async deleteOwnAccount(userId: string) {
    try {
      // Verificamos que el usuario existe
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }
      
      const userRole = await this.userRepository.findRoleByUserId(userId);
      if (userRole?.role === 'admin') {
        throw new ApiError(403, 'Los administradores no pueden eliminar su cuenta');
      }
      
      console.log(`Iniciando eliminación COMPLETA de usuario con ID: ${user.id} (Auth ID: ${userId})`);

      // PASO 1: Eliminar todas las direcciones del usuario
      console.log('Eliminando direcciones del usuario...');
      await this.userRepository.deleteUserAddresses(user.id);
      
      // PASO 2: Eliminar todos los pedidos del usuario y sus detalles
      console.log('Eliminando pedidos del usuario...');
      await this.userRepository.deleteUserOrders(user.id);
      
      // PASO 3: Eliminar todos los pagos asociados al usuario
      console.log('Eliminando pagos del usuario...');
      await this.userRepository.deleteUserPayments(user.id);
      
      // PASO 4: Eliminar el rol del usuario
      console.log('Eliminando rol del usuario...');
      await this.userRepository.deleteUserRole(userId);
      
      // PASO 5: Eliminar el registro del usuario de la tabla users
      console.log('Eliminando datos de usuario...');
      await this.userRepository.deleteUserRecord(user.id);
      
      // PASO 6: Eliminar las credenciales de autenticación en Supabase Auth
      try {
        // Importar el cliente de admin con permisos elevados
        const { supabaseAdmin } = await import('../config/database.js');
        
        console.log('Eliminando credenciales de autenticación...');
        
        // Intentar eliminar directamente el usuario de Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
          console.error('Error al eliminar usuario de Auth:', error);
          // Intentar como alternativa deshabilitar el usuario
          try {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              userId,
              {
                ban_duration: '8760h', // 1 año (equivalente a baneado permanentemente)
                user_metadata: { deleted: true, deletedAt: new Date().toISOString() }
              }
            );
            
            if (updateError) {
              console.error('Error al deshabilitar usuario:', updateError);
            }
          } catch (banError) {
            console.error('Error al intentar deshabilitar usuario:', banError);
          }
        } else {
          console.log('Usuario eliminado correctamente de Supabase Auth');
        }
      } catch (authError) {
        // Si falla la eliminación de Auth, lo registramos pero continuamos
        console.error('Error durante la eliminación de usuario en Auth:', authError);
      }
      
      console.log('Eliminación completa de usuario finalizada exitosamente');
      
      return { message: 'Tu cuenta ha sido eliminada correctamente' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al eliminar tu cuenta');
    }
  }

  // Cambiar rol del usuario (solo admin)
  // Roles válidos: 'customer', 'admin'
  async updateUserRole(userId: string, role: string) {
    try {
      const validRoles = ['customer', 'admin'];
      
      if (!validRoles.includes(role)) {
        throw new ApiError(400, 'Rol inválido');
      }

      const updatedRole = await this.userRepository.updateRole(userId, role);

      return {
        message: 'Rol actualizado correctamente',
        role: updatedRole.role
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar rol');
    }
  }
}
