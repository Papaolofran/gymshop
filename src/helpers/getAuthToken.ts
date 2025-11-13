import { supabase } from '../supabase/client';

/** Obtener el token de autenticación actual de Supabase */
export const getAuthToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }
  
  return session.access_token;
};
