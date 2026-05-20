import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Garment } from '../types';
import { DEMO_GARMENTS, DEMO_SELLER, DEMO_SELLER2 } from '../lib/demoData';
import { supabase } from '../lib/supabase';

interface InventoryContextType {
  garments: Garment[];
  addGarment: (g: Garment) => void;
  updateStatus: (id: string, status: Garment['status']) => void;
  loading: boolean;
}

const InventoryContext = createContext<InventoryContextType>({} as InventoryContextType);

const STORAGE_KEY = 'revibe_inventory';

function loadLocal(): Garment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(items: Garment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Seed demo data into local inventory on first load
function seedIfEmpty(items: Garment[]): Garment[] {
  if (items.length > 0) return items;
  const seeded = DEMO_GARMENTS.map((g) => ({ ...g }));
  saveLocal(seeded);
  return seeded;
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('garments')
          .select('*, seller:profiles(*), category:categories(*)')
          .order('created_at', { ascending: false });
        if (error || !data || data.length === 0) throw new Error('no data');
        setGarments(data);
        saveLocal(data);
      } catch {
        const local = seedIfEmpty(loadLocal());
        setGarments(local);
      } finally {
        setLoading(false);
      }
    };
    fetchFromSupabase();
  }, []);

  const addGarment = useCallback((g: Garment) => {
    setGarments((prev) => {
      const updated = [g, ...prev];
      saveLocal(updated);
      return updated;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: Garment['status']) => {
    setGarments((prev) => {
      const updated = prev.map((g) => g.id === id ? { ...g, status } : g);
      saveLocal(updated);
      return updated;
    });

    // Fire-and-forget to Supabase
    supabase.from('garments').update({ status }).eq('id', id).then(() => {});
  }, []);

  return (
    <InventoryContext.Provider value={{ garments, addGarment, updateStatus, loading }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);

// Re-export seller profiles for convenience
export { DEMO_SELLER, DEMO_SELLER2 };
