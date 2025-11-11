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
