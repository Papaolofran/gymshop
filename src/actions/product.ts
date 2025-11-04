import { supabase } from "../supabase/client";
import type { Product, VariantProduct } from "../interfaces";
import type { Tables } from "../supabase/supabase";

export const getProducts = async (): Promise<Product[]> => {
  const { data: producto, error} = await supabase
    .from("producto")
    .select("*, variante(*)")
    .order("creado", { ascending: false });

  if(error) {
    console.log(error.message);
    throw new Error(error.message);
  }

   // Transform database fields to match Product interface
   return producto.map((item) => ({
    id: item.id,
    name: item.nombre,
    brand: item.marca,
    slug: item.slug || item.nombre.toLowerCase().replace(/\s+/g, '-'), // Use DB slug or generate from name
    description: item.descripcion,
    images: item.imagenes,
    created_at: item.creado,
    variants: item.variante.map((v: Tables<'variante'>) => ({
      id: v.id,
      stock: v.stock,
      price: v.precio,
      storage: v.tamaño || '', // Use tamaño as storage
      color: v.color || '',
      color_name: v.nombre_color || '',
    } as VariantProduct))
  }));
};

export const getFilteredProducts = async ({
  page = 1,
  brands = [],
}: {
  page: number;
  brands: string[];
}) => {
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  
  let query = supabase
  .from("producto")
  .select("*, variante(*)", { count: "exact" })
  .order("creado", { ascending: false })
  .range(from, to);

if(brands.length > 0) {
  query = query.in("marca", brands);
}

const { data: producto, error, count } = await query;

if(error) {
  console.log(error.message);
  throw new Error(error.message);
}

// Transform database fields to match Product interface
const transformedData = producto?.map((item) => ({
  id: item.id,
  name: item.nombre,
  brand: item.marca,
  slug: item.slug || item.nombre.toLowerCase().replace(/\s+/g, '-'),
  description: item.descripcion,
  images: item.imagenes,
  created_at: item.creado,
  variants: item.variante.map((v: Tables<'variante'>) => ({
    id: v.id,
    stock: v.stock,
    price: v.precio,
    storage: v.tamaño || '',
    color: v.color || '',
    color_name: v.nombre_color || '',
  } as VariantProduct))
})) as Product[];

return { data: transformedData, count };
};

export const getRecentProducts = async () => {
 const { data: producto, error } = await supabase
    .from("producto")
    .select("*, variante(*)")
    .order("creado", { ascending: false })
    .limit(4);

  if(error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  // Transform database fields to match Product interface
  return producto.map((item) => ({
    id: item.id,
    name: item.nombre,
    brand: item.marca,
    slug: item.slug || item.nombre.toLowerCase().replace(/\s+/g, '-'), // Use DB slug or generate from name
    description: item.descripcion,
    images: item.imagenes,
    created_at: item.creado,
    variants: item.variante.map((v: Tables<'variante'>) => ({
      id: v.id,
      stock: v.stock,
      price: v.precio,
      storage: v.tamaño || '', // Use tamaño as storage
      color: v.color || '',
      color_name: v.nombre_color || '',
    } as VariantProduct))
  }));
}

export const getDestacadosProducts = async () => {
 const { data: producto, error } = await supabase
    .from("producto")
    .select("*, variante(*)")
    .limit(20);

  if(error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  // Seleccionar 4 productos destacados

  const destacados = producto.slice(0, 4);

  // Transform database fields to match Product interface
  return destacados.map((item) => ({
    id: item.id,
    name: item.nombre,
    brand: item.marca,
    slug: item.slug || item.nombre.toLowerCase().replace(/\s+/g, '-'), // Use DB slug or generate from name
    description: item.descripcion,
    images: item.imagenes,
    created_at: item.creado,
    variants: item.variante.map((v: Tables<'variante'>) => ({
      id: v.id,
      stock: v.stock,
      price: v.precio,
      storage: v.tamaño || '', // Use tamaño as storage
      color: v.color || '',
      color_name: v.nombre_color || '',
    } as VariantProduct))
  }));
};