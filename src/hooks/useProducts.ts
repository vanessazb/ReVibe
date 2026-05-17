import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Garment } from '../types';
import { DEMO_GARMENTS } from '../lib/demoData';

interface ProductFilters {
  gender?: string;
  category?: string;
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  vibe?: string;
  status?: string;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  limit?: number;
  sellerId?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('garments')
          .select('*, seller:profiles(*), category:categories(*)');

        if (filters.status) {
          query = query.eq('status', filters.status);
        } else {
          query = query.eq('status', 'disponible');
        }

        if (filters.sizes?.length) query = query.in('size', filters.sizes);
        if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
        if (filters.condition) query = query.eq('condition', filters.condition);
        if (filters.vibe) query = query.ilike('vibe', `%${filters.vibe}%`);
        if (filters.search) query = query.ilike('title', `%${filters.search}%`);
        if (filters.sellerId) query = query.eq('seller_id', filters.sellerId);
        if (filters.limit) query = query.limit(filters.limit);

        if (filters.sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (filters.sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error: err } = await query;
        if (err) throw err;
        setProducts(data || []);
        setError(null);
      } catch {
        // Fallback to demo data
        let demoData = [...DEMO_GARMENTS];

        const statusFilter = filters.status || 'disponible';
        demoData = demoData.filter((g) => g.status === statusFilter);

        if (filters.sizes?.length) {
          demoData = demoData.filter((g) => g.size && filters.sizes!.includes(g.size));
        }
        if (filters.minPrice !== undefined) {
          demoData = demoData.filter((g) => g.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
          demoData = demoData.filter((g) => g.price <= filters.maxPrice!);
        }
        if (filters.condition) {
          demoData = demoData.filter((g) => g.condition === filters.condition);
        }
        if (filters.vibe) {
          demoData = demoData.filter((g) =>
            g.vibe?.toLowerCase().includes(filters.vibe!.toLowerCase())
          );
        }
        if (filters.search) {
          demoData = demoData.filter((g) =>
            g.title.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        if (filters.sellerId) {
          demoData = demoData.filter((g) => g.seller_id === filters.sellerId);
        }

        if (filters.sortBy === 'price_asc') {
          demoData.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price_desc') {
          demoData.sort((a, b) => b.price - a.price);
        }

        if (filters.limit) {
          demoData = demoData.slice(0, filters.limit);
        }

        setProducts(demoData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error };
}
