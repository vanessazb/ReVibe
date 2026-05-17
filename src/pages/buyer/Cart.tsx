import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { DEMO_GARMENTS } from '../../lib/demoData';
import { useState } from 'react';

export function Cart() {
  const { items, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fallback to demo data if no real items
  const displayItems = items.length > 0
    ? items
    : user
    ? []
    : DEMO_GARMENTS.slice(0, 2).map((g) => ({
        id: g.id,
        buyer_id: 'demo',
        garment_id: g.id,
        added_at: new Date().toISOString(),
        garment: g,
      }));

  const total = displayItems.reduce((sum, item) => sum + (item.garment?.price || 0), 0);

  const handleRemove = async (garmentId: string) => {
    setRemovingId(garmentId);
    try {
      await removeFromCart(garmentId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-8">
        Mi carrito
        {displayItems.length > 0 && (
          <span className="text-base font-normal text-[#6B6B6B] ml-2">
            ({displayItems.length} {displayItems.length === 1 ? 'prenda' : 'prendas'})
          </span>
        )}
      </h1>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 border border-[#E8E5E0] rounded-lg">
              <div className="w-24 h-32 bg-[#E8E5E0] rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E8E5E0] rounded w-1/2" />
                <div className="h-3 bg-[#E8E5E0] rounded w-1/3" />
                <div className="h-5 bg-[#E8E5E0] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega las prendas que más te gusten."
          action={
            <Link to="/catalogo">
              <Button size="lg">Explorar catálogo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-[#E8E5E0] rounded-lg hover:shadow-sm transition-shadow"
              >
                <Link to={`/producto/${item.garment_id}`} className="flex-shrink-0">
                  <div className="w-24 h-32 rounded-lg overflow-hidden bg-[#F5F3F0]">
                    {item.garment?.images?.[0] ? (
                      <img
                        src={item.garment.images[0]}
                        alt={item.garment.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                        <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      {item.garment?.brand && (
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">
                          {item.garment.brand}
                        </p>
                      )}
                      <Link to={`/producto/${item.garment_id}`}>
                        <h3 className="text-sm font-medium text-[#1A1A1A] hover:text-[#C8B89A] transition-colors line-clamp-2">
                          {item.garment?.title}
                        </h3>
                      </Link>
                      {item.garment?.size && (
                        <p className="text-xs text-[#6B6B6B] mt-1">Talla: {item.garment.size}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.garment_id)}
                      disabled={removingId === item.garment_id}
                      className="text-[#6B6B6B] hover:text-[#C0392B] transition-colors flex-shrink-0"
                      aria-label="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3">
                    <span className="font-mono font-semibold text-[#1A1A1A]">
                      {formatCOP(item.garment?.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F3F0] rounded-lg p-6 sticky top-24">
              <h2 className="font-semibold text-[#1A1A1A] mb-4">Resumen del pedido</h2>

              <div className="space-y-3 mb-5 text-sm">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-[#6B6B6B]">
                    <span className="truncate mr-2 flex-1">{item.garment?.title}</span>
                    <span className="font-mono flex-shrink-0">{formatCOP(item.garment?.price || 0)}</span>
                  </div>
                ))}

                <div className="border-t border-[#E8E5E0] pt-3 flex justify-between font-semibold text-[#1A1A1A]">
                  <span>Total</span>
                  <span className="font-mono">{formatCOP(total)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceder al pago
              </Button>

              <Link
                to="/catalogo"
                className="block text-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors mt-3"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
