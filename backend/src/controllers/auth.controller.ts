import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { supabase } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';

export const verifySession = async (req: AuthRequest, res: Response) => {
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
    .select('id, email, full_name, phone')
    .eq('user_id', user.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: userData?.full_name,
        phone: userData?.phone,
        role: roleData?.role || 'customer'
      }
    }
  });
};
