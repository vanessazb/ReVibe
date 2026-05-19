import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';
import { DEMO_GARMENTS } from '../lib/demoData';

interface CartContextType {
  items: CartItem[];
  count: number;
  addToCart: (garmentId: string) => Promise<void>;
  removeFromCart: (garmentId: string) => Promise<void>;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const CART_STORAGE_KEY = 'revibe_cart';

function loadLocalCart(userId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(`${CART_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(userId: string, items: CartItem[]) {
  localStorage.setItem(`${CART_STORAGE_KEY}_${userId}`, JSON.stringify(items));
}

function buildCartItem(garmentId: string, userId: string): CartItem | null {
  const garment = DEMO_GARMENTS.find((g) => g.id === garmentId);
  if (!garment) return null;
  return {
    id: `cart-${userId}-${garmentId}`,
    buyer_id: userId,
    garment_id: garmentId,
    added_at: new Date().toISOString(),
    garment,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Try to fetch from Supabase; fall back to localStorage on any error
  const fetchCart = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, garment:garments(*, seller:profiles(*))')
        .eq('buyer_id', userId);

      if (error || !data || data.length === 0) {
        // Use localStorage cart
        const local = loadLocalCart(userId);
        setItems(local);
      } else {
        setItems(data);
        // Sync to localStorage so it persists
        saveLocalCart(userId, data);
      }
    } catch {
      const local = loadLocalCart(userId);
      setItems(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    } else {
      setItems([]);
    }
  }, [user?.id]);

  const addToCart = async (garmentId: string) => {
    if (!user) throw new Error('Debes iniciar sesión');

    // Prevent duplicates
    if (items.some((i) => i.garment_id === garmentId)) return;

    // Optimistic local update first
    const newItem = buildCartItem(garmentId, user.id);
    if (!newItem) return;

    const updated = [...items, newItem];
    setItems(updated);
    saveLocalCart(user.id, updated);

    // Try to persist in Supabase (fire and forget — failure is acceptable)
    try {
      await supabase
        .from('cart_items')
        .insert({ buyer_id: user.id, garment_id: garmentId });
    } catch {
      // Supabase unavailable — localStorage already has it, nothing to do
    }
  };

  const removeFromCart = async (garmentId: string) => {
    if (!user) return;

    const updated = items.filter((i) => i.garment_id !== garmentId);
    setItems(updated);
    saveLocalCart(user.id, updated);

    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('buyer_id', user.id)
        .eq('garment_id', garmentId);
    } catch {
      // Supabase unavailable — already removed from local state
    }
  };

  const clearCart = () => {
    if (user) saveLocalCart(user.id, []);
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, count: items.length, addToCart, removeFromCart, clearCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
