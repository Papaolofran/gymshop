import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno');
}

// Cliente normal para operaciones regulares
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente con privilegios de admin para operaciones sensibles como eliminar usuarios
// Usa la service_role key que tiene permisos elevados
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
