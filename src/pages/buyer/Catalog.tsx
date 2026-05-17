import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { SIZES, CONDITION_LABELS, VIBE_OPTIONS } from '../../lib/formatters';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

const PAGE_SIZE = 12;

export function Catalog() {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedGender(searchParams.get('gender') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const filters = {
    gender: selectedGender || undefined,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    condition: selectedCondition || undefined,
    vibe: selectedVibe || undefined,
    search: search || undefined,
    sortBy,
  };

  const { products, loading } = useProducts(filters);

  const activeFilterCount = [
    selectedGender,
    selectedSizes.length > 0,
    minPrice || maxPrice,
    selectedCondition,
    selectedVibe,
    search,
  ].filter(Boolean).length;

  const paginatedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);

  const clearFilters = () => {
    setSelectedGender('');
    setSelectedSizes([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCondition('');
    setSelectedVibe('');
    setSearch('');
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Género</h3>
        <div className="space-y-2">
          {['', 'mujer', 'hombre', 'unisex'].map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                checked={selectedGender === g}
                onChange={() => { setSelectedGender(g); setPage(1); }}
                className="accent-[#1A1A1A]"
              />
              <span className="text-sm text-[#1A1A1A] group-hover:text-[#C8B89A] transition-colors">
                {g === '' ? 'Todo' : g === 'mujer' ? 'Mujer' : g === 'hombre' ? 'Hombre' : 'Unisex'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="border-t border-[#E8E5E0] pt-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Talla</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.slice(0, 12).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded border transition-all duration-150',
                selectedSizes.includes(size)
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'border-[#E8E5E0] text-[#1A1A1A] hover:border-[#C8B89A]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="border-t border-[#E8E5E0] pt-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Precio (COP)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín."
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            className="w-full border border-[#E8E5E0] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C8B89A]"
          />
          <span className="text-[#6B6B6B] text-xs">–</span>
          <input
            type="number"
            placeholder="Máx."
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            className="w-full border border-[#E8E5E0] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C8B89A]"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="border-t border-[#E8E5E0] pt-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Estado</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="condition"
              checked={selectedCondition === ''}
              onChange={() => { setSelectedCondition(''); setPage(1); }}
              className="accent-[#1A1A1A]"
            />
            <span className="text-sm text-[#1A1A1A] group-hover:text-[#C8B89A] transition-colors">Todos</span>
          </label>
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                checked={selectedCondition === value}
                onChange={() => { setSelectedCondition(value); setPage(1); }}
                className="accent-[#1A1A1A]"
              />
              <span className="text-sm text-[#1A1A1A] group-hover:text-[#C8B89A] transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div className="border-t border-[#E8E5E0] pt-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Vibe</h3>
        <div className="flex flex-wrap gap-2">
          {['', ...VIBE_OPTIONS].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setSelectedVibe(v); setPage(1); }}
              className={clsx(
                'px-2.5 py-1 text-xs rounded border transition-all duration-150',
                selectedVibe === v
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'border-[#E8E5E0] text-[#1A1A1A] hover:border-[#C8B89A]'
              )}
            >
              {v || 'Todos'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
        <span>Inicio</span>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium">Catálogo</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#1A1A1A]">Filtros</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#C0392B] hover:underline"
                >
                  Limpiar ({activeFilterCount})
                </button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full border border-[#E8E5E0] rounded px-3 py-2 text-sm pl-9 focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#E8E5E0] rounded text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-[#1A1A1A] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-[#E8E5E0] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8B89A] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-[#6B6B6B]">
              {loading ? 'Cargando...' : `${products.length} prendas encontradas`}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#C0392B] hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No encontramos prendas"
              description="Intenta con otros filtros o busca algo diferente."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((garment) => (
                <ProductCard key={garment.id} garment={garment} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-[#E8E5E0] rounded text-sm disabled:opacity-40 hover:bg-[#F5F3F0] transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    'w-9 h-9 rounded text-sm font-medium transition-colors',
                    page === p
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#E8E5E0] hover:bg-[#F5F3F0]'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-[#E8E5E0] rounded text-sm disabled:opacity-40 hover:bg-[#F5F3F0] transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#1A1A1A]">Filtros</h2>
              <button onClick={() => setFiltersOpen(false)}>
                <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterPanel />
            <div className="mt-6 flex gap-3">
              {activeFilterCount > 0 && (
                <Button variant="secondary" fullWidth onClick={() => { clearFilters(); setFiltersOpen(false); }}>
                  Limpiar
                </Button>
              )}
              <Button fullWidth onClick={() => setFiltersOpen(false)}>
                Ver {products.length} prendas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
