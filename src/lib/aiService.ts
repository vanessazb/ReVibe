// AI analysis service — simulates Claude-powered garment analysis
// In production: replace simulateAIAnalysis with a real Supabase Edge Function
// that calls the Anthropic API.

export interface AIAnalysisResult {
  description: string;
  suggestedPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  priceReasoning: string;
  suggestedVibe: string;
  vibeConfidence: number;
  suggestedSize: string;
  processingMs: number;
}

// ─── Brand tier pricing (estimated COP retail value) ───────────────────────
const BRAND_RETAIL: Record<string, number> = {
  'zara': 180000, 'mango': 220000, 'pull&bear': 150000, 'bershka': 130000,
  'stradivarius': 140000, 'h&m': 110000, 'forever 21': 120000,
  'tommy hilfiger': 400000, 'calvin klein': 380000, 'guess': 350000,
  'michael kors': 600000, 'coach': 800000, 'diesel': 450000,
  'nike': 280000, 'adidas': 260000, "levi's": 320000,
  'studio f': 180000, 'bkul': 160000, 'vélez': 350000,
  'arturo calle': 200000, 'chevignon': 280000, 'tennis': 140000,
  'crystal': 90000, 'koaj': 85000, 'bronzini': 110000, 'pronto': 100000,
};

const CONDITION_MULTIPLIER: Record<string, number> = {
  nuevo_con_etiqueta: 0.62,
  como_nuevo: 0.46,
  buen_estado: 0.32,
  uso_visible: 0.20,
};

// ─── Vibe inference from keywords ──────────────────────────────────────────
const VIBE_RULES: Array<{ keywords: string[]; vibe: string; confidence: number }> = [
  { keywords: ['vintage', 'retro', 'años', 'estampado', 'floral', 'bohemio', 'seda', 'lino'], vibe: 'Vintage', confidence: 0.88 },
  { keywords: ['oversize', 'streetwear', 'hoodie', 'sudadera', 'denim', 'cargo', 'sneakers', 'nike', 'adidas', 'jordan'], vibe: 'Streetwear', confidence: 0.91 },
  { keywords: ['camel', 'beige', 'neutro', 'caqui', 'abrigo', 'trench', 'blazer', 'oxford', 'tommy', 'ralph', 'old money', 'clásico', 'estructurado'], vibe: 'Old Money', confidence: 0.85 },
  { keywords: ['minimalista', 'básico', 'simple', 'clean', 'monocromático', 'negro', 'blanco', 'gris', 'slim'], vibe: 'Minimalista', confidence: 0.83 },
  { keywords: ['casual', 'cómodo', 'diario', 'jeans', 'camiseta', 'polo', 'informal'], vibe: 'Casual', confidence: 0.80 },
];

function inferVibe(title: string, description: string, brand: string): { vibe: string; confidence: number } {
  const text = `${title} ${description} ${brand}`.toLowerCase();
  let best = { vibe: 'Casual', confidence: 0.72 };
  for (const rule of VIBE_RULES) {
    const matches = rule.keywords.filter((k) => text.includes(k)).length;
    if (matches > 0) {
      const score = rule.confidence - (matches > 2 ? 0 : 0.05 * (3 - matches));
      if (score > best.confidence) best = { vibe: rule.vibe, confidence: score };
    }
  }
  return best;
}

// ─── Price suggestion ───────────────────────────────────────────────────────
function suggestPrice(brand: string, condition: string, _title: string): {
  price: number; min: number; max: number; reasoning: string;
} {
  const brandKey = brand.toLowerCase().trim();
  const retail = BRAND_RETAIL[brandKey] ?? 150000;
  const multiplier = CONDITION_MULTIPLIER[condition] ?? 0.35;
  const base = Math.round((retail * multiplier) / 5000) * 5000;
  const min = Math.round(base * 0.85 / 5000) * 5000;
  const max = Math.round(base * 1.20 / 5000) * 5000;

  const conditionLabels: Record<string, string> = {
    nuevo_con_etiqueta: 'nuevo con etiqueta', como_nuevo: 'como nuevo',
    buen_estado: 'buen estado', uso_visible: 'uso visible',
  };
  const condLabel = conditionLabels[condition] ?? condition;
  const brandDisplay = brand || 'sin marca especificada';

  const reasoning = `Basado en el precio de mercado de ${brandDisplay} (~$${retail.toLocaleString('es-CO')} nuevo) `
    + `y el estado "${condLabel}", el rango ideal es $${min.toLocaleString('es-CO')} – $${max.toLocaleString('es-CO')} COP. `
    + `Precio sugerido: $${base.toLocaleString('es-CO')} COP para venta rápida.`;

  return { price: base, min, max, reasoning };
}

// ─── Description generation in ReVibe brand tone ───────────────────────────
const OPENERS = [
  'Una pieza que no necesita presentación.',
  'Para quien sabe que lo mejor no siempre es nuevo.',
  'El tipo de prenda que defines como "favorita" desde la primera vez que te la pones.',
  'Clásica por naturaleza, única en tu clóset.',
  'Porque el estilo verdadero no tiene fecha de vencimiento.',
  'Esa prenda que buscabas sin saber que la estabas buscando.',
];

const CLOSERS = [
  'Lista para escribir su próximo capítulo contigo.',
  'Dale una segunda vida — y una historia nueva.',
  'Revisada y aprobada por el equipo ReVibe.',
  'Moda circular con propósito.',
  'Tu clóset te lo agradecerá.',
];

function generateDescription(
  _title: string, brand: string, condition: string,
  vibe: string, gender: string
): string {
  const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
  const closer = CLOSERS[Math.floor(Math.random() * CLOSERS.length)];

  const conditionPhrases: Record<string, string> = {
    nuevo_con_etiqueta: 'Llega con etiqueta original, jamás usada.',
    como_nuevo: 'En estado impecable — prácticamente nueva, sin señales de uso.',
    buen_estado: 'Con uso moderado y muy buen cuidado. Sin defectos visibles.',
    uso_visible: 'Con marcas de uso características de una prenda querida y vivida.',
  };

  const vibePhrases: Record<string, string> = {
    'Vintage': 'Con ese espíritu vintage que solo el tiempo sabe dar.',
    'Old Money': 'Atemporalidad en estado puro — elegancia sin esfuerzo.',
    'Streetwear': 'Energía urbana, actitud y comodidad en una sola pieza.',
    'Minimalista': 'Minimalismo que habla por sí solo.',
    'Casual': 'Versátil, cómoda y perfecta para el día a día.',
  };

  const brandPhrase = brand ? `De ${brand}, una marca que no requiere explicación.` : '';
  const conditionPhrase = conditionPhrases[condition] ?? '';
  const vibePhrase = vibePhrases[vibe] ?? '';
  const genderCtx = gender === 'mujer' ? 'Diseñada para ella.' : gender === 'hombre' ? 'Diseñada para él.' : '';

  const parts = [opener, brandPhrase, conditionPhrase, vibePhrase, genderCtx, closer]
    .filter(Boolean)
    .join(' ');

  return parts;
}

// ─── Size inference ─────────────────────────────────────────────────────────
function inferSize(): string {
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

// ─── Main export ────────────────────────────────────────────────────────────
export async function analyzeGarment(params: {
  title: string;
  brand: string;
  condition: string;
  gender: string;
  imageFile?: File;
}): Promise<AIAnalysisResult> {
  const start = Date.now();
  // Simulate realistic AI processing time
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

  const { title, brand, condition, gender } = params;
  const vibeResult = inferVibe(title, '', brand);
  const priceResult = suggestPrice(brand, condition, title);
  const description = generateDescription(title, brand, condition, vibeResult.vibe, gender);
  const suggestedSize = inferSize();

  return {
    description,
    suggestedPrice: priceResult.price,
    priceRangeMin: priceResult.min,
    priceRangeMax: priceResult.max,
    priceReasoning: priceResult.reasoning,
    suggestedVibe: vibeResult.vibe,
    vibeConfidence: Math.round(vibeResult.confidence * 100),
    suggestedSize,
    processingMs: Date.now() - start,
  };
}
