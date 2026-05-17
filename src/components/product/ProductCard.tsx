import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Garment } from '../../types';
import { formatCOP } from '../../lib/formatters';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  garment: Garment;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ garment, onFavorite, isFavorite }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const image = garment.images?.[0] || '';
  const statusVariant =
    garment.status === 'disponible'
      ? 'disponible'
      : garment.status === 'vendida'
        ? 'vendida'
        : garment.status === 'en_revision'
          ? 'en_revision'
          : 'pausada';

  return (
    <Link to={`/producto/${garment.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-[#F5F3F0] aspect-[3/4] mb-3 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
        {image && !imgError ? (
          <img
            src={image}
            alt={garment.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
            <svg
              className="w-12 h-12 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={statusVariant}>
            {garment.status === 'disponible'
              ? 'Disponible'
              : garment.status === 'vendida'
                ? 'Vendida'
                : garment.status === 'en_revision'
                  ? 'En revisión'
                  : 'Pausada'}
          </Badge>
        </div>
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite(garment.id);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Guardar en favoritos"
          >
            <span className={isFavorite ? 'text-red-500' : 'text-[#6B6B6B]'}>♥</span>
          </button>
        )}
      </div>
      <div>
        {garment.brand && (
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-0.5">{garment.brand}</p>
        )}
        <h3 className="text-sm font-medium text-[#1A1A1A] leading-tight mb-1 line-clamp-2">
          {garment.title}
        </h3>
        <div className="flex items-center gap-2">
          {garment.size && (
            <span className="text-xs bg-[#C8B89A]/20 text-[#A09070] px-1.5 py-0.5 rounded">
              {garment.size}
            </span>
          )}
          <span className="font-mono text-sm font-semibold text-[#1A1A1A]">
            {formatCOP(garment.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
