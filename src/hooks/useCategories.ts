import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';

interface Category {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};
