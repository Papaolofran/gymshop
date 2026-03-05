export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    price: number;
    color?: string | null;
    colorName?: string | null;
    size?: string | null;
    flavor?: string | null;
    weight?: string | null;
    product?: {
      name: string;
      images: string[];
    } | null;
  } | null;
}

export interface Order {
  id: number;
  userId: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  addressId?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryDate: string;
  shippingCost: number;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  addressId: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
}

export interface PaymentPreferenceResponse {
  id: string;
  init_point: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}
