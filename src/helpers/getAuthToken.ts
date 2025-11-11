import { supabase } from '../supabase/client';

/**
 * Obtiene el token de autenticación actual de Supabase
 * @returns El access token
 * @throws Error si no hay sesión activa
 */
export const getAuthToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }
  
  return session.access_token;
};
