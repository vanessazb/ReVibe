import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Garment } from '../../types';
import { DEMO_GARMENTS } from '../../lib/demoData';
import { formatCOP, CONDITION_LABELS } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [garment, setGarment] = useState<Garment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchGarment = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('garments')
          .select('*, seller:profiles(*), category:categories(*)')
          .eq('id', id)
          .single();
        if (error) throw error;
        setGarment(data);
      } catch {
        const demo = DEMO_GARMENTS.find((g) => g.id === id);
        if (demo) setGarment(demo);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGarment();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!garment) return;
    setAddingToCart(true);
    try {
      await addToCart(garment.id);
      toast('Prenda agregada al carrito', 'success');
    } catch {
      toast('Error al agregar al carrito', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-[#E8E5E0] rounded-lg" />
          <div className="space-y-4">
            <div className="h-6 bg-[#E8E5E0] rounded w-1/3" />
            <div className="h-8 bg-[#E8E5E0] rounded w-2/3" />
            <div className="h-10 bg-[#E8E5E0] rounded w-1/4" />
            <div className="h-20 bg-[#E8E5E0] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!garment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Prenda no encontrada</h2>
        <p className="text-[#6B6B6B] mb-6">Esta prenda ya no está disponible.</p>
        <Link to="/catalogo">
          <Button>Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  const images = garment.images?.length > 0 ? garment.images : [''];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-[#1A1A1A] transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium line-clamp-1">{garment.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#F5F3F0] mb-3">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={garment.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Favorite button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label="Guardar en favoritos"
            >
              <span className={`text-lg ${isFavorite ? 'text-red-500' : 'text-[#6B6B6B]'}`}>♥</span>
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-24 rounded overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-[#1A1A1A]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Brand */}
          {garment.brand && (
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2">{garment.brand}</p>
          )}

          {/* Title */}
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-3 leading-tight">
            {garment.title}
          </h1>

          {/* Price */}
          <p className="font-mono text-3xl font-bold text-[#1A1A1A] mb-5">
            {formatCOP(garment.price)}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-6">
            {garment.size && (
              <span className="inline-flex items-center px-3 py-1 bg-[#F5F3F0] rounded text-sm font-medium text-[#1A1A1A]">
                Talla: {garment.size}
              </span>
            )}
            {garment.condition && (
              <Badge variant="default">{CONDITION_LABELS[garment.condition]}</Badge>
            )}
            {garment.vibe && (
              <span className="inline-flex items-center px-3 py-1 bg-[#C8B89A]/20 rounded text-sm text-[#A09070] font-medium">
                {garment.vibe}
              </span>
            )}
            <Badge variant={garment.status === 'disponible' ? 'disponible' : 'vendida'}>
              {garment.status === 'disponible' ? 'Disponible' : 'Vendida'}
            </Badge>
          </div>

          {/* Description */}
          {garment.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Descripción</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{garment.description}</p>
            </div>
          )}

          {/* Seller info */}
          {garment.seller && (
            <div className="flex items-center gap-3 p-4 bg-[#F5F3F0] rounded-lg mb-6">
              <Avatar name={garment.seller.full_name} url={garment.seller.avatar_url} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {garment.seller.full_name || 'Vendedor'}
                </p>
                {garment.seller.city && (
                  <p className="text-xs text-[#6B6B6B]">{garment.seller.city}</p>
                )}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          {garment.status === 'disponible' ? (
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                loading={addingToCart}
              >
                Agregar al carrito
              </Button>
              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? '♥ Guardado en favoritos' : '♡ Guardar en favoritos'}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-[#F5F3F0] rounded-lg text-center">
              <p className="text-sm text-[#6B6B6B] font-medium">Esta prenda ya fue vendida</p>
              <Link to="/catalogo" className="text-sm text-[#1A1A1A] underline mt-1 block">
                Ver prendas similares
              </Link>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-[#E8E5E0]">
            <div className="text-center">
              <span className="text-2xl">✅</span>
              <p className="text-xs text-[#6B6B6B] mt-1">Prenda verificada</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-[#6B6B6B] mt-1">Pago seguro</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">📦</span>
              <p className="text-xs text-[#6B6B6B] mt-1">Envío a todo el país</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
