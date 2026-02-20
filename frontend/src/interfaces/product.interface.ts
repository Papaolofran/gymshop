export interface Color {
    name: string;
    color: string;
    price: number;
}

export interface VariantProduct {
  id: string;
  stock: number;
  price: number;
  product_id: string;
  color: string | null;
  color_name: string | null;
  size: string | null;
  weight: string | null;
  flavor: string | null;
}

export interface Category {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    slug: string;
    features: string[];
    images: string[];
    created_at: string;
    category_id: string;
    categories?: Category;
    variants: VariantProduct[];
}

export interface PreparedProducts {
  id: string;
    name: string;
    brand: string;
    slug: string;
    images: string[];
    created_at: string;
    price: number;
    colors: {
      name: string;
      color: string;
    }[],
    variants: VariantProduct[];
}