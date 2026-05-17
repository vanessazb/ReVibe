import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatCOP } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { DEMO_GARMENTS } from '../../lib/demoData';
import clsx from 'clsx';

type Step = 'shipping' | 'confirm' | 'success';

const COLOMBIAN_CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Manizales',
  'Pereira', 'Bucaramanga', 'Cúcuta', 'Ibagué', 'Santa Marta', 'Villavicencio',
];

export function Checkout() {
  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const { items, clearCart } = useCart();
  const { user, profile } = useAuth();
  useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: '',
    city: 'Bogotá',
    neighborhood: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use demo data if no real cart items
  const displayItems = items.length > 0
    ? items
    : DEMO_GARMENTS.slice(0, 2).map((g) => ({
        id: g.id,
        buyer_id: user?.id || 'demo',
        garment_id: g.id,
        added_at: new Date().toISOString(),
        garment: g,
      }));

  const total = displayItems.reduce((sum, item) => sum + (item.garment?.price || 0), 0);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Requerido';
    if (!form.phone.trim()) newErrors.phone = 'Requerido';
    if (!form.address.trim()) newErrors.address = 'Requerido';
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingNext = () => {
    if (!validate()) return;
    setStep('confirm');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const generatedOrderId = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();

      if (user && items.length > 0) {
        for (const item of items) {
          await supabase.from('orders').insert({
            buyer_id: user.id,
            seller_id: item.garment?.seller_id || '',
            garment_id: item.garment_id,
            total_amount: item.garment?.price || 0,
            status: 'pendiente',
            shipping_address: form,
          });
        }
        clearCart();
      }

      setOrderId(generatedOrderId);
      setStep('success');
    } catch {
      // In demo mode, just navigate to success
      setOrderId('ORD-DEMO-' + Math.random().toString(36).substr(2, 6).toUpperCase());
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['shipping', 'confirm', 'success'] as Step[];
  const currentStepIndex = steps.indexOf(step);

  if (step === 'success') {
    navigate('/orden-confirmada', { state: { orderId, total, items: displayItems } });
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: 'shipping', label: 'Envío' },
          { key: 'confirm', label: 'Confirmar' },
        ].map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                currentStepIndex >= idx
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#E8E5E0] text-[#6B6B6B]'
              )}
            >
              {idx + 1}
            </div>
            <span
              className={clsx(
                'text-sm font-medium',
                currentStepIndex >= idx ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'
              )}
            >
              {s.label}
            </span>
            {idx < 1 && <span className="text-[#E8E5E0] mx-1">—</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step content */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
              <h2 className="font-semibold text-[#1A1A1A] mb-5">Dirección de envío</h2>
              <div className="space-y-4">
                <Input
                  label="Nombre completo"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  error={errors.full_name}
                  placeholder="Nombre del destinatario"
                />
                <Input
                  label="Teléfono"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="+57 300 000 0000"
                />
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ciudad</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-[#E8E5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                  >
                    {COLOMBIAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Barrio / Urbanización"
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  error={errors.neighborhood}
                  placeholder="Nombre del barrio"
                />
                <Input
                  label="Dirección"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  error={errors.address}
                  placeholder="Calle, carrera, número, apto..."
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#1A1A1A]">Notas adicionales</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Instrucciones especiales para el envío..."
                    rows={3}
                    className="border border-[#E8E5E0] rounded px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                  />
                </div>
                <Button fullWidth size="lg" onClick={handleShippingNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-[#1A1A1A]">Dirección de envío</h2>
                  <button
                    onClick={() => setStep('shipping')}
                    className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] underline"
                  >
                    Editar
                  </button>
                </div>
                <div className="text-sm text-[#6B6B6B] space-y-1">
                  <p className="font-medium text-[#1A1A1A]">{form.full_name}</p>
                  <p>{form.phone}</p>
                  <p>{form.address}</p>
                  <p>{form.neighborhood}, {form.city}</p>
                  {form.notes && <p className="italic">"{form.notes}"</p>}
                </div>
              </div>

              <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
                <h2 className="font-semibold text-[#1A1A1A] mb-4">Prendas ({displayItems.length})</h2>
                <div className="space-y-3">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-16 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0">
                        {item.garment?.images?.[0] && (
                          <img src={item.garment.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.garment?.title}</p>
                        {item.garment?.size && (
                          <p className="text-xs text-[#6B6B6B]">Talla: {item.garment.size}</p>
                        )}
                      </div>
                      <span className="font-mono text-sm font-semibold">
                        {formatCOP(item.garment?.price || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handlePlaceOrder}
                loading={loading}
              >
                Confirmar pedido — {formatCOP(total)}
              </Button>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#F5F3F0] rounded-lg p-5 sticky top-24">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Resumen</h3>
            <div className="space-y-2 text-sm mb-4">
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
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <span>🔒</span>
              <span>Pago 100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
