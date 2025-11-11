import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl) {
  throw new Error(
    "Falta la variable de entorno VITE_SUPABASE_URL. " +
    "Por favor, crea un archivo .env en la raíz del proyecto y agrega tu URL de Supabase."
  );
}

if (!supabaseKey) {
  throw new Error(
    "Falta la variable de entorno VITE_SUPABASE_ANON_KEY. " +
    "Por favor, crea un archivo .env en la raíz del proyecto y agrega tu API Key de Supabase."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);