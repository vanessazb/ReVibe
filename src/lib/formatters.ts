export const formatCOP = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '34', '36', '38', '40', '42', '44',
  'Único', '6', '7', '8', '9', '10',
];

export const CONDITION_LABELS: Record<string, string> = {
  nuevo_con_etiqueta: 'Nuevo con etiqueta',
  como_nuevo: 'Como nuevo',
  buen_estado: 'Buen estado',
  uso_visible: 'Uso visible',
};

export const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  vendida: 'Vendida',
  pausada: 'Pausada',
  en_revision: 'En revisión',
};

export const VIBE_OPTIONS = [
  'Vintage',
  'Minimalista',
  'Streetwear',
  'Old Money',
  'Casual',
];

export const POPULAR_BRANDS = [
  'Zara', 'H&M', 'Mango', 'Pull&Bear', 'Bershka', 'Stradivarius',
  'Forever 21', 'Nike', 'Adidas', "Levi's", 'Tommy Hilfiger',
  'Calvin Klein', 'Diesel', 'Guess', 'Michael Kors', 'Coach',
  'Studio F', 'Bkul', 'Vélez', 'Arturo Calle', 'Chevignon',
  'Pronto', 'Tennis', 'Crystal', 'Koaj', 'Bronzini',
];
