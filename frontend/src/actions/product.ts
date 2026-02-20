import { supabase } from "../supabase/client";

export const getProducts = async () => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return products;
};

export const getFilteredProducts = async ({
  page = 1,
  brands = [],
  categories = [],
}: {
  page: number;
  brands: string[];
  categories: string[];
}) => {
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from("products")
    .select("*, variants(*), categories(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (brands.length > 0) {
    query = query.in("brand", brands);
  }

  if (categories.length > 0) {
    // Primero obtener los IDs de las categorías por nombre
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id")
      .in("name", categories);
    
    if (categoriesData && categoriesData.length > 0) {
      const categoryIds = categoriesData.map(c => c.id);
      query = query.in("category_id", categoryIds);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return { data, count };
};

export const getRecentProducts = async () => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return products;
};

export const getDestacadosProducts = async () => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("highlighted", true)
    .limit(20);

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  // Si hay menos de 4 destacados, retornar los que haya
  // Si hay más, seleccionar 4 al azar
  if (products.length <= 4) {
    return products;
  }

  const destacados = products
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  return destacados;
};

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*), categories(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return data;
};

export const searchProducts = async (searchTerm: string) => {
  // Normalizar el término de búsqueda: convertir a minúsculas y remover acentos
  const normalizedTerm = searchTerm.toLowerCase();

  try {
    // Buscar productos por nombre con ILIKE (case-insensitive)
    const {data, error} = await supabase
      .from("products")
      .select("*, variants(*)")
      .or(`name.ilike.%${normalizedTerm}%,brand.ilike.%${normalizedTerm}%`); // Buscar en nombre y marca

    if (error) {
      console.log(error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
};