import { useLocation, Link } from 'react-router-dom';
import { formatCOP } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';

export function OrderConfirmation() {
  const location = useLocation();
  const state = location.state as {
    orderId?: string;
    total?: number;
    items?: Array<{ garment?: { title?: string; price?: number; images?: string[] } }>;
  } | null;

  const orderId = state?.orderId || 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const total = state?.total || 85000;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-[#2D7A4F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-[#2D7A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-serif text-4xl font-bold text-[#1A1A1A] mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-[#6B6B6B] text-lg mb-8 leading-relaxed">
        Tu pedido ha sido recibido. Te notificaremos cuando sea enviado.
      </p>

      {/* Order details */}
      <div className="bg-[#F5F3F0] rounded-lg p-6 mb-8 text-left">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#6B6B6B] mb-1">Número de pedido</p>
            <p className="font-mono font-bold text-[#1A1A1A]">{orderId}</p>
          </div>
          <div>
            <p className="text-[#6B6B6B] mb-1">Total pagado</p>
            <p className="font-mono font-bold text-[#1A1A1A]">{formatCOP(total)}</p>
          </div>
          <div>
            <p className="text-[#6B6B6B] mb-1">Estado</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
              Pendiente
            </span>
          </div>
          <div>
            <p className="text-[#6B6B6B] mb-1">Tiempo estimado</p>
            <p className="font-medium text-[#1A1A1A] text-xs">3–5 días hábiles</p>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-white border border-[#E8E5E0] rounded-lg p-6 mb-8 text-left">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">¿Qué sigue?</h3>
        <ol className="space-y-3 text-sm text-[#6B6B6B]">
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>El vendedor confirma y prepara tu pedido (24–48 horas).</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>Recibirás un correo con el número de seguimiento cuando sea enviado.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>La entrega llega a tu dirección en 3–5 días hábiles.</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/catalogo">
          <Button size="lg">Seguir comprando</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="lg">Ir al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
