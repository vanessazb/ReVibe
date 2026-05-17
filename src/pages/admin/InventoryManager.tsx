import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';
import { formatCOP, CONDITION_LABELS, STATUS_LABELS } from '../../lib/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { DEMO_GARMENTS } from '../../lib/demoData';
import type { Garment } from '../../types';
import { formatDate } from '../../lib/formatters';
import clsx from 'clsx';

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'vendida', label: 'Vendidas' },
  { value: 'pausada', label: 'Pausadas' },
];

export function InventoryManager() {
  const [statusFilter, setStatusFilter] = useState('en_revision');
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const { products, loading } = useProducts({ status: statusFilter || undefined });
  const displayProducts = products.length > 0 ? products : DEMO_GARMENTS;
  const filteredProducts = statusFilter
    ? displayProducts.filter((p) => p.status === statusFilter)
    : displayProducts;

  const pendingCount = displayProducts.filter((p) => p.status === 'en_revision').length;

  const handleAction = async (garmentId: string, newStatus: 'disponible' | 'pausada') => {
    setActionLoading(garmentId);
    try {
      const { error } = await supabase
        .from('garments')
        .update({ status: newStatus })
        .eq('id', garmentId);
      if (error) throw error;
      toast(
        newStatus === 'disponible' ? 'Prenda aprobada' : 'Prenda rechazada',
        newStatus === 'disponible' ? 'success' : 'info'
      );
    } catch {
      toast(
        newStatus === 'disponible'
          ? 'Prenda aprobada (demo)'
          : 'Prenda rechazada (demo)',
        newStatus === 'disponible' ? 'success' : 'info'
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <span className="text-amber-600">⚠️</span>
          <p className="text-sm text-amber-700">
            <strong>{pendingCount} prendas</strong> están esperando revisión
          </p>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors',
              statusFilter === tab.value
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#6B6B6B] hover:bg-white'
            )}
          >
            {tab.label}
            {tab.value === 'en_revision' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-amber-500 text-white px-1 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-[#E8E5E0] rounded" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5E0] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F3F0] border-b border-[#E8E5E0]">
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Prenda</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Vendedor</th>
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
                          <p className="font-medium text-[#1A1A1A] truncate max-w-[140px]">{g.title}</p>
                          {g.brand && <p className="text-xs text-[#6B6B6B]">{g.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {g.seller?.full_name || 'Desconocido'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={g.status as 'disponible' | 'vendida' | 'en_revision' | 'pausada'}>
                        {STATUS_LABELS[g.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{formatCOP(g.price)}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {g.condition ? CONDITION_LABELS[g.condition] : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap">
                      {formatDate(g.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {g.status === 'en_revision' && (
                          <>
                            <button
                              onClick={() => handleAction(g.id, 'disponible')}
                              disabled={actionLoading === g.id}
                              className="text-xs px-2.5 py-1 bg-[#2D7A4F] text-white rounded hover:bg-[#235f3d] transition-colors disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleAction(g.id, 'pausada')}
                              disabled={actionLoading === g.id}
                              className="text-xs px-2.5 py-1 bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setSelectedGarment(g); setEditModalOpen(true); }}
                          className="text-xs px-2.5 py-1 border border-[#E8E5E0] rounded hover:bg-[#F5F3F0] transition-colors"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedGarment(null); }}
        title="Detalle de prenda"
      >
        {selectedGarment && (
          <div className="space-y-4">
            {selectedGarment.images?.[0] && (
              <img
                src={selectedGarment.images[0]}
                alt={selectedGarment.title}
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
            )}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Título', value: selectedGarment.title },
                { label: 'Precio', value: formatCOP(selectedGarment.price) },
                { label: 'Marca', value: selectedGarment.brand || '—' },
                { label: 'Talla', value: selectedGarment.size || '—' },
                { label: 'Estado', value: selectedGarment.condition ? CONDITION_LABELS[selectedGarment.condition] : '—' },
                { label: 'Vibe', value: selectedGarment.vibe || '—' },
                { label: 'Vendedor', value: selectedGarment.seller?.full_name || '—' },
                { label: 'Descripción', value: selectedGarment.description || '—' },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <span className="text-[#6B6B6B] w-24 flex-shrink-0">{row.label}:</span>
                  <span className="text-[#1A1A1A] font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {selectedGarment.status === 'en_revision' && (
              <div className="flex gap-3 pt-4 border-t border-[#E8E5E0]">
                <Button
                  fullWidth
                  onClick={() => {
                    handleAction(selectedGarment.id, 'disponible');
                    setEditModalOpen(false);
                  }}
                >
                  Aprobar prenda
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    handleAction(selectedGarment.id, 'pausada');
                    setEditModalOpen(false);
                  }}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
