import { useState } from 'react';
import { DEMO_ORDERS } from '../../lib/demoData';
import { formatCOP, formatDate } from '../../lib/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import clsx from 'clsx';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  enviada: 'Enviada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const STATUS_VARIANTS: Record<string, 'disponible' | 'vendida' | 'en_revision' | 'pausada' | 'default'> = {
  entregada: 'disponible',
  enviada: 'en_revision',
  cancelada: 'vendida',
  pendiente: 'pausada',
  confirmada: 'default',
};

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'enviada', label: 'Enviadas' },
  { value: 'entregada', label: 'Entregadas' },
];

export function SalesHistory() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  let orders = [...DEMO_ORDERS];
  if (statusFilter) orders = orders.filter((o) => o.status === statusFilter);
  if (search) {
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.garment?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const exportCSV = () => {
    const headers = ['ID', 'Comprador', 'Prenda', 'Total', 'Estado', 'Fecha'];
    const rows = orders.map((o) => [
      o.id,
      o.buyer?.full_name || '',
      o.garment?.title || '',
      o.total_amount,
      o.status,
      o.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ventas_revibe.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por ID, comprador o prenda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[#E8E5E0] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
        />
        <Button variant="secondary" onClick={exportCSV} size="sm">
          📥 Exportar CSV
        </Button>
      </div>

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
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-[#F5F3F0] rounded-lg p-4 mb-5 flex items-center justify-between">
        <p className="text-sm text-[#6B6B6B]">
          <span className="font-semibold text-[#1A1A1A]">{orders.length}</span> órdenes
        </p>
        <p className="text-sm text-[#6B6B6B]">
          Total:{' '}
          <span className="font-mono font-bold text-[#1A1A1A]">{formatCOP(total)}</span>
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E5E0] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#E8E5E0]">
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">ID Orden</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Comprador</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Prenda</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5E0]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6B6B6B]">
                    No hay órdenes que mostrar
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F5F3F0] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-[#F5F3F0] px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1A1A1A]">
                      <p className="font-medium">{order.buyer?.full_name || '—'}</p>
                      <p className="text-xs text-[#6B6B6B]">{order.buyer?.city || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.garment?.images?.[0] && (
                          <div className="w-8 h-10 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0">
                            <img src={order.garment.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="truncate max-w-[120px] text-[#1A1A1A]">
                          {order.garment?.title || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{formatCOP(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
