import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { DEMO_GARMENTS, DEMO_SELLER } from '../../lib/demoData';

export function MyListings() {
  const { profile } = useAuth();

  const { products, loading } = useProducts({
    sellerId: profile?.id || DEMO_SELLER.id,
  });

  const displayProducts = products.length > 0 ? products : DEMO_GARMENTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Mis prendas</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {displayProducts.length} prenda{displayProducts.length !== 1 ? 's' : ''} publicada{displayProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/vendedor/consignar">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva prenda
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayProducts.length === 0 ? (
        <EmptyState
          icon="👗"
          title="Aún no tienes prendas"
          description="Consigna tu primera prenda y comienza a vender."
          action={
            <Link to="/vendedor/consignar">
              <Button size="lg">Consignar prenda</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((garment) => (
            <ProductCard key={garment.id} garment={garment} />
          ))}
        </div>
      )}
    </div>
  );
}
