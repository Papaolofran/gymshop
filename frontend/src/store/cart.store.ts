import { create, type StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ICartItem } from "../components/shared/CartItem";
import toast from 'react-hot-toast';

export interface CartState {
  items: ICartItem[];
  addItem: (item: ICartItem) => void;
  removeItem: (variantId: string) => void;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const storeApi: StateCreator<CartState> = ((set, get) => ({
  items: [],
  
  addItem: (item: ICartItem) => {
    const { items } = get();
    const existingItem = items.find(i => i.variantId === item.variantId);
    
    if (existingItem) {
      // Si el item ya existe, incrementar la cantidad sin exceder el stock
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity > item.stock) {
        // No agregar más de lo disponible, ajustar al stock máximo
        toast.error(`Stock insuficiente. Solo hay ${item.stock} unidades disponibles`, {
          duration: 3000,
        });
        set({
          items: items.map(i =>
            i.variantId === item.variantId
              ? { ...i, quantity: item.stock }
              : i
          ),
        });
        return;
      }
      set({
        items: items.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: newQuantity }
            : i
        ),
      });
      toast.success(`Cantidad actualizada en el carrito`, {
        duration: 2000,
      });
    } else {
      // Si no existe, agregar validando que no exceda el stock
      const quantityToAdd = Math.min(item.quantity, item.stock);
      if (quantityToAdd < item.quantity) {
        toast.error(`Stock insuficiente. Solo se agregaron ${quantityToAdd} unidades`, {
          duration: 3000,
        });
      } else {
        toast.success(`¡${item.name} agregado al carrito!`, {
          icon: '🛒',
          duration: 2000,
        });
      }
      set({ items: [...items, { ...item, quantity: quantityToAdd }] });
    }
  },
  
  removeItem: (variantId: string) => {
    const { items } = get();
    const item = items.find(i => i.variantId === variantId);
    
    set(state => ({
      items: state.items.filter(item => item.variantId !== variantId),
    }));
    
    if (item) {
      toast.success(`${item.name} eliminado del carrito`, {
        icon: '🗑️',
        duration: 2000,
      });
    }
  },
  
  incrementItem: (variantId: string) => {
    const { items } = get();
    const item = items.find(i => i.variantId === variantId);
    
    if (item && item.quantity >= item.stock) {
      toast.error(`Stock máximo alcanzado (${item.stock} unidades)`, {
        duration: 2000,
      });
      return;
    }
    
    set(state => ({
      items: state.items.map(item => {
        if (item.variantId === variantId) {
          if (item.quantity >= item.stock) {
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    }));
  },
  
  decrementItem: (variantId: string) => {
    set(state => ({
      items: state.items.map(item =>
        item.variantId === variantId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
    toast.success('Carrito vaciado', {
      icon: '🧹',
      duration: 2000,
    });
  },
  
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));

export const useCartStore = create<CartState>()(
  devtools(
    persist(storeApi, {
      name: "cart-storage",
    })
  )
);