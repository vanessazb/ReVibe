import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

const CATEGORIES = [
  {
    title: 'Mujer',
    subtitle: 'Prendas femeninas',
    link: '/catalogo?gender=mujer',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop',
  },
  {
    title: 'Hombre',
    subtitle: 'Estilo masculino',
    link: '/catalogo?gender=hombre',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  },
  {
    title: 'Accesorios',
    subtitle: 'El toque final',
    link: '/catalogo?category=accesorios',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
  },
];

export function Home() {
  const { products, loading } = useProducts({ limit: 8, sortBy: 'newest' });

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8B89A] text-sm uppercase tracking-widest mb-4 font-medium">
            Moda circular colombiana
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            Segunda mano.
            <br />
            Primera clase.
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre prendas únicas de segunda mano. Compra con estilo, vende con propósito, vive la
            moda sostenible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium rounded hover:bg-white hover:text-[#1A1A1A] transition-all duration-200"
            >
              Explorar catálogo
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#C8B89A] text-[#C8B89A] font-medium rounded hover:bg-[#C8B89A] hover:text-[#1A1A1A] transition-all duration-200"
            >
              Consignar prendas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#F5F3F0] border-b border-[#E8E5E0]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-[#E8E5E0]">
          <div className="text-center px-4">
            <p className="font-mono text-2xl font-bold text-[#1A1A1A]">+1.200</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Prendas disponibles</p>
          </div>
          <div className="text-center px-4">
            <p className="font-mono text-2xl font-bold text-[#1A1A1A]">+450</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Vendedores activos</p>
          </div>
          <div className="text-center px-4">
            <p className="font-mono text-2xl font-bold text-[#1A1A1A]">100%</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Verificadas</p>
          </div>
        </div>
      </section>

      {/* Novedades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#C8B89A] mb-1">Lo más reciente</p>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Recién llegadas</h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#1A1A1A] hover:text-[#C8B89A] transition-colors"
          >
            Ver todo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((garment) => <ProductCard key={garment.id} garment={garment} />)}
        </div>

        <div className="text-center mt-10">
          <Link to="/catalogo">
            <Button variant="secondary" size="lg">
              Ver todo el catálogo
            </Button>
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E8E5E0]">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#C8B89A] mb-1">Explora por</p>
          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Categorías</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.title} to={cat.link} className="group relative overflow-hidden rounded-lg">
              <div className="aspect-[4/3] relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-serif text-3xl font-bold mb-1">{cat.title}</h3>
                  <p className="text-sm text-white/80">{cat.subtitle}</p>
                  <span className="mt-3 text-xs border border-white/60 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explorar →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F3F0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#C8B89A] mb-1">Simple y rápido</p>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">¿Cómo funciona?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">📸</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Fotografía tu prenda</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Toma fotos claras de tu ropa. Nuestro sistema de IA procesa las imágenes automáticamente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Publica y espera</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Completa los detalles, establece tu precio y publica. Revisamos cada prenda.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">💰</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">3. ¡Vende y recibe!</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Cuando alguien compra tu prenda, recibe el pago directamente en tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Seller */}
      <section className="bg-[#C8B89A]/20 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-[#A09070] mb-2">Para vendedores</p>
          <h2 className="font-serif text-4xl font-bold text-[#1A1A1A] mb-4">
            ¿Tienes ropa sin usar?
          </h2>
          <p className="text-[#6B6B6B] text-lg mb-8 leading-relaxed">
            Dale una segunda vida a tus prendas y gana dinero. Es fácil, rápido y seguro. Más de 450
            vendedores ya confían en ReVibe.
          </p>
          <Link to="/registro">
            <Button size="lg">Consigna con ReVibe</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
