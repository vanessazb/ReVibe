import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { formatCOP, formatDate, CONDITION_LABELS, STATUS_LABELS } from '../../lib/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import type { Garment } from '../../types';
import clsx from 'clsx';

const STATUS_TABS = [
  { value: 'en_revision', label: 'En revisión' },
  { value: '', label: 'Todas' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'vendida', label: 'Vendidas' },
  { value: 'pausada', label: 'Pausadas' },
];

export function InventoryManager() {
  const [statusFilter, setStatusFilter] = useState('en_revision');
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { garments, updateStatus, loading } = useInventory();

  const filteredGarments = statusFilter
    ? garments.filter((g) => g.status === statusFilter)
    : garments;

  const pendingCount = garments.filter((g) => g.status === 'en_revision').length;

  const handleAction = async (garment: Garment, newStatus: 'disponible' | 'pausada') => {
    setActionLoading(garment.id);
    await new Promise((r) => setTimeout(r, 400)); // brief feedback delay
    updateStatus(garment.id, newStatus);
    toast(
      newStatus === 'disponible'
        ? `✓ "${garment.title}" aprobada y publicada en el catálogo`
        : `"${garment.title}" rechazada y pausada`,
      newStatus === 'disponible' ? 'success' : 'info'
    );
    setActionLoading(null);
    if (detailOpen && selectedGarment?.id === garment.id) {
      setDetailOpen(false);
      setSelectedGarment(null);
    }
  };

  return (
    <div>
      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">⚠️</span>
            <p className="text-sm text-amber-800">
              <strong>{pendingCount} prenda{pendingCount > 1 ? 's' : ''}</strong> esperando revisión
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('en_revision')}
            className="text-xs text-amber-700 underline font-medium"
          >
            Revisar ahora →
          </button>
        </div>
      )}

      {pendingCount === 0 && statusFilter === 'en_revision' && (
        <div className="bg-[#2D7A4F]/5 border border-[#2D7A4F]/20 rounded-lg p-4 mb-6 flex items-center gap-2">
          <span className="text-[#2D7A4F]">✓</span>
          <p className="text-sm text-[#2D7A4F]">No hay prendas pendientes de revisión</p>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors font-medium',
              statusFilter === tab.value
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#6B6B6B] hover:bg-[#F5F3F0]'
            )}
          >
            {tab.label}
            {tab.value === 'en_revision' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-[#6B6B6B] mb-3">
        {filteredGarments.length} prenda{filteredGarments.length !== 1 ? 's' : ''}
        {statusFilter ? ` en estado "${STATUS_LABELS[statusFilter] || 'seleccionado'}"` : ' en total'}
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-[#E8E5E0] rounded-lg" />)}
        </div>
      ) : filteredGarments.length === 0 ? (
        <div className="text-center py-12 text-[#6B6B6B]">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-sm">No hay prendas en este estado</p>
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
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Vibe</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {filteredGarments.map((g) => (
                  <tr
                    key={g.id}
                    className={clsx(
                      'hover:bg-[#F5F3F0] transition-colors',
                      g.status === 'en_revision' && 'bg-amber-50/40'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-13 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0" style={{ height: '3.25rem' }}>
                          {g.images?.[0] && (
                            <img src={g.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#1A1A1A] truncate max-w-[160px]">{g.title}</p>
                          {g.brand && <p className="text-xs text-[#6B6B6B]">{g.brand}</p>}
                          {g.size && <p className="text-xs text-[#6B6B6B]">Talla {g.size}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap">
                      {g.seller?.full_name || 'Desconocido'}
                      {g.seller?.city && <span className="block text-xs">{g.seller.city}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={g.status as any}>{STATUS_LABELS[g.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#1A1A1A]">
                      {formatCOP(g.price)}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {g.condition ? CONDITION_LABELS[g.condition] : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {g.vibe || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap text-xs">
                      {formatDate(g.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        {g.status === 'en_revision' && (
                          <>
                            <button
                              onClick={() => handleAction(g, 'disponible')}
                              disabled={actionLoading === g.id}
                              className="text-xs px-2.5 py-1 bg-[#2D7A4F] text-white rounded hover:bg-[#235f3d] transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
                            >
                              {actionLoading === g.id ? '...' : '✓ Aprobar'}
                            </button>
                            <button
                              onClick={() => handleAction(g, 'pausada')}
                              disabled={actionLoading === g.id}
                              className="text-xs px-2.5 py-1 border border-[#C0392B] text-[#C0392B] rounded hover:bg-[#C0392B] hover:text-white transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {g.status === 'disponible' && (
                          <button
                            onClick={() => handleAction(g, 'pausada')}
                            disabled={actionLoading === g.id}
                            className="text-xs px-2.5 py-1 border border-[#E8E5E0] text-[#6B6B6B] rounded hover:border-[#C0392B] hover:text-[#C0392B] transition-colors"
                          >
                            Pausar
                          </button>
                        )}
                        {g.status === 'pausada' && (
                          <button
                            onClick={() => handleAction(g, 'disponible')}
                            disabled={actionLoading === g.id}
                            className="text-xs px-2.5 py-1 border border-[#E8E5E0] text-[#6B6B6B] rounded hover:border-[#2D7A4F] hover:text-[#2D7A4F] transition-colors"
                          >
                            Publicar
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedGarment(g); setDetailOpen(true); }}
                          className="text-xs px-2.5 py-1 border border-[#E8E5E0] rounded hover:bg-[#F5F3F0] transition-colors whitespace-nowrap"
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
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedGarment(null); }}
        title="Detalle de prenda"
      >
        {selectedGarment && (
          <div className="space-y-4">
            {selectedGarment.images?.[0] && (
              <img
                src={selectedGarment.images[0]}
                alt={selectedGarment.title}
                className="w-full aspect-[3/4] object-cover rounded-lg max-h-80 object-top"
              />
            )}

            <div className="flex items-center gap-2">
              <Badge variant={selectedGarment.status as any}>
                {STATUS_LABELS[selectedGarment.status]}
              </Badge>
              {selectedGarment.images_processed && (
                <span className="text-xs text-[#2D7A4F] bg-[#2D7A4F]/10 px-2 py-0.5 rounded">✨ Procesada por IA</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Título', value: selectedGarment.title },
                { label: 'Precio', value: formatCOP(selectedGarment.price) },
                { label: 'Marca', value: selectedGarment.brand || '—' },
                { label: 'Talla', value: selectedGarment.size || '—' },
                { label: 'Estado', value: selectedGarment.condition ? CONDITION_LABELS[selectedGarment.condition] : '—' },
                { label: 'Vibe', value: selectedGarment.vibe || '—' },
                { label: 'Vendedor', value: selectedGarment.seller?.full_name || '—' },
                { label: 'Ciudad', value: selectedGarment.seller?.city || '—' },
                { label: 'Fecha', value: formatDate(selectedGarment.created_at) },
              ].map((row) => (
                <div key={row.label} className="flex gap-2 py-1 border-b border-[#F5F3F0] last:border-0">
                  <span className="text-[#6B6B6B] w-20 flex-shrink-0">{row.label}</span>
                  <span className="text-[#1A1A1A] font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {selectedGarment.description && (
              <div className="p-3 bg-[#F5F3F0] rounded-lg">
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-[#6B6B6B] italic leading-relaxed">"{selectedGarment.description}"</p>
              </div>
            )}

            {selectedGarment.status === 'en_revision' && (
              <div className="flex gap-3 pt-2 border-t border-[#E8E5E0]">
                <Button
                  fullWidth
                  onClick={() => handleAction(selectedGarment, 'disponible')}
                  loading={actionLoading === selectedGarment.id}
                >
                  ✓ Aprobar y publicar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleAction(selectedGarment, 'pausada')}
                  loading={actionLoading === selectedGarment.id}
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
