import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  count: number;
  addToCart: (garmentId: string) => Promise<void>;
  removeFromCart: (garmentId: string) => Promise<void>;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cart_items')
        .select('*, garment:garments(*, seller:profiles(*))')
        .eq('buyer_id', user.id);
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (garmentId: string) => {
    if (!user) throw new Error('Debes iniciar sesión');
    try {
      await supabase
        .from('cart_items')
        .insert({ buyer_id: user.id, garment_id: garmentId });
      await fetchCart();
    } catch (err) {
      throw err;
    }
  };

  const removeFromCart = async (garmentId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('buyer_id', user.id)
        .eq('garment_id', garmentId);
      await fetchCart();
    } catch {
      // ignore
    }
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, count: items.length, addToCart, removeFromCart, clearCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
