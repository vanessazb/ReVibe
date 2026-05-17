import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { formatCOP, CONDITION_LABELS, STATUS_LABELS } from '../../lib/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DEMO_GARMENTS, DEMO_SELLER } from '../../lib/demoData';
import { formatDate } from '../../lib/formatters';
import clsx from 'clsx';

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'vendida', label: 'Vendidas' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'pausada', label: 'Pausadas' },
];

export function SellerDashboard() {
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const seller = profile || DEMO_SELLER;

  const { products, loading } = useProducts({
    sellerId: profile?.id || DEMO_SELLER.id,
    status: statusFilter || undefined,
  });

  const displayProducts = products.length > 0 ? products : DEMO_GARMENTS;
  const filteredProducts = statusFilter
    ? displayProducts.filter((p) => p.status === statusFilter)
    : displayProducts;

  const stats = {
    activas: displayProducts.filter((p) => p.status === 'disponible').length,
    vendidas: displayProducts.filter((p) => p.status === 'vendida').length,
    enRevision: displayProducts.filter((p) => p.status === 'en_revision').length,
    ingresos: displayProducts
      .filter((p) => p.status === 'vendida')
      .reduce((sum, p) => sum + p.price, 0),
  };

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
            Hola, {seller.full_name?.split(' ')[0] || 'Vendedor'}
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1 capitalize">{today}</p>
        </div>
        <Link to="/vendedor/consignar">
          <Button size="lg">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Consignar prenda
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Prendas activas</p>
          <p className="font-mono text-3xl font-bold text-[#1A1A1A]">{stats.activas}</p>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Vendidas</p>
          <p className="font-mono text-3xl font-bold text-[#2D7A4F]">{stats.vendidas}</p>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">En revisión</p>
          <p className="font-mono text-3xl font-bold text-amber-600">{stats.enRevision}</p>
        </div>
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Ingresos COP</p>
          <p className="font-mono text-xl font-bold text-[#1A1A1A]">{formatCOP(stats.ingresos)}</p>
        </div>
      </div>

      {/* Filters and view toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-5">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                'px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors',
                statusFilter === tab.value
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#6B6B6B] hover:bg-[#F5F3F0]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={clsx(
              'p-2 rounded transition-colors',
              viewMode === 'table' ? 'bg-[#1A1A1A] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F3F0]'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 6h14M10 18h14" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 rounded transition-colors',
              viewMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F3F0]'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#E8E5E0] rounded" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="👗"
          title="No tienes prendas en esta categoría"
          action={
            <Link to="/vendedor/consignar">
              <Button>Consignar primera prenda</Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((g) => (
            <ProductCard key={g.id} garment={g} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5E0] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F3F0] border-b border-[#E8E5E0]">
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A] min-w-[200px]">Prenda</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Precio</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Condición</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {filteredProducts.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F5F3F0] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0">
                          {g.images?.[0] && (
                            <img src={g.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#1A1A1A] truncate max-w-[160px]">{g.title}</p>
                          {g.brand && <p className="text-xs text-[#6B6B6B]">{g.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={g.status as 'disponible' | 'vendida' | 'en_revision' | 'pausada'}
                      >
                        {STATUS_LABELS[g.status] || g.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{formatCOP(g.price)}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {g.condition ? CONDITION_LABELS[g.condition] : '-'}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{formatDate(g.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/producto/${g.id}`}
                        className="text-xs text-[#1A1A1A] hover:text-[#C8B89A] underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        to="/vendedor/consignar"
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#333] transition-colors"
        aria-label="Consignar prenda"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
