import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database.js';
import { ApiError } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ApiError(401, 'Token inválido o expirado');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('user_id', user.id)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email || '',
      fullName: userData?.full_name,
      role: roleData?.role || 'customer'
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Usuario no autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'No tienes permisos para acceder a este recurso'));
    }

    next();
  };
};
