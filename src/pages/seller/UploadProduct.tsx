import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { processGarmentImage } from '../../lib/imageAI';
import { analyzeGarment, type AIAnalysisResult } from '../../lib/aiService';
import { formatCOP, SIZES, CONDITION_LABELS, VIBE_OPTIONS, POPULAR_BRANDS } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';
import type { Garment } from '../../types';

type Step = 1 | 2 | 3;
type AIPhase = 'idle' | 'processing-image' | 'analyzing' | 'done';

interface FormData {
  title: string;
  description: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  vibe: string;
  gender: string;
  images: File[];
  processedUrls: string[];
  originalUrls: string[];
}

const GENDER_OPTIONS = [
  { value: 'mujer', label: '👗', desc: 'Mujer' },
  { value: 'hombre', label: '👔', desc: 'Hombre' },
  { value: 'unisex', label: '✨', desc: 'Unisex' },
];

const CONDITION_DESCRIPTIONS: Record<string, string> = {
  nuevo_con_etiqueta: 'Nunca usado, etiqueta original',
  como_nuevo: 'Usado 1-2 veces, impecable',
  buen_estado: 'Uso moderado, sin defectos visibles',
  uso_visible: 'Tiene marcas de uso, bien descritas',
};

export function UploadProduct() {
  const [step, setStep] = useState<Step>(1);
  const [aiPhase, setAiPhase] = useState<AIPhase>('idle');
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showProcessed, setShowProcessed] = useState(true);

  const { user, profile } = useAuth();
  const { addGarment } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    title: '', description: '', brand: '', size: '',
    condition: '', price: '', vibe: '', gender: 'mujer',
    images: [], processedUrls: [], originalUrls: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // ─── Step 1: Image drop & processing ─────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles
      .filter((f) => f.size <= 10 * 1024 * 1024)
      .slice(0, 6 - form.images.length);

    if (validFiles.length === 0) return;

    const newOriginals = validFiles.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 6),
      originalUrls: [...prev.originalUrls, ...newOriginals].slice(0, 6),
    }));

    setAiPhase('processing-image');
    try {
      const results = await Promise.all(validFiles.map((f) => processGarmentImage(f)));
      const processed = results.map((r) => r.processedUrl);
      setForm((prev) => ({
        ...prev,
        processedUrls: [...prev.processedUrls, ...processed].slice(0, 6),
      }));
      setAiPhase('done');
    } catch {
      setForm((prev) => ({
        ...prev,
        processedUrls: [...prev.processedUrls, ...newOriginals].slice(0, 6),
      }));
      setAiPhase('done');
    }
  }, [form.images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 6,
    maxSize: 10 * 1024 * 1024,
    disabled: aiPhase === 'processing-image',
  });

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      processedUrls: prev.processedUrls.filter((_, i) => i !== idx),
      originalUrls: prev.originalUrls.filter((_, i) => i !== idx),
    }));
    setSelectedImageIndex(0);
    if (form.images.length <= 1) setAiPhase('idle');
  };

  // ─── Step 2: AI analysis ──────────────────────────────────────────────────
  const runAIAnalysis = async () => {
    if (!form.title && !form.brand && !form.condition) return;
    setAiPhase('analyzing');
    try {
      const result = await analyzeGarment({
        title: form.title,
        brand: form.brand,
        condition: form.condition,
        gender: form.gender,
        imageFile: form.images[0],
      });
      setAiResult(result);
      setAiPhase('done');
    } catch {
      setAiPhase('done');
    }
  };

  const applyAISuggestion = (field: 'description' | 'price' | 'vibe' | 'size') => {
    if (!aiResult) return;
    if (field === 'description') setForm((p) => ({ ...p, description: aiResult.description }));
    if (field === 'price') setForm((p) => ({ ...p, price: aiResult.suggestedPrice.toString() }));
    if (field === 'vibe') setForm((p) => ({ ...p, vibe: aiResult.suggestedVibe }));
    if (field === 'size') setForm((p) => ({ ...p, size: aiResult.suggestedSize }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'El título es requerido';
    if (!form.condition) errs.condition = 'Selecciona el estado';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 1000)
      errs.price = 'Ingresa un precio válido (mínimo $1.000)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep2Next = async () => {
    if (!validateStep2()) return;
    if (!aiResult && form.title) await runAIAnalysis();
    setStep(3);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!agreed) { toast('Debes confirmar antes de enviar', 'error'); return; }
    setSubmitting(true);

    try {
      const newGarment: Garment = {
        id: `new-${Date.now()}`,
        seller_id: user?.id || 'demo-seller',
        title: form.title,
        description: form.description || null,
        brand: form.brand || null,
        size: form.size || null,
        condition: form.condition as Garment['condition'],
        price: Number(form.price),
        status: 'en_revision',
        images: form.processedUrls.length > 0 ? form.processedUrls : form.originalUrls,
        images_processed: form.processedUrls.length > 0,
        ai_suggested_size: aiResult?.suggestedSize || null,
        vibe: form.vibe || aiResult?.suggestedVibe || null,
        category_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: profile ?? {
          id: user?.id || 'demo-seller',
          email: user?.email || 'vendedor@revibe.co',
          full_name: 'Vendedor',
          role: 'seller' as const, city: null, phone: null,
          avatar_url: null, bio: null, created_at: '', updated_at: '',
        },
      };

      addGarment(newGarment);
      toast('✓ Prenda enviada para revisión — el equipo ReVibe la revisará pronto', 'success');
      navigate('/vendedor');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  const currentDisplayUrl = showProcessed
    ? (form.processedUrls[selectedImageIndex] || form.originalUrls[selectedImageIndex])
    : form.originalUrls[selectedImageIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-1">Consignar prenda</h1>
        <p className="text-sm text-[#6B6B6B]">ReVibe procesa tus fotos y genera la ficha del producto con IA</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[{ n: 1, label: 'Fotos' }, { n: 2, label: 'Información' }, { n: 3, label: 'Revisión' }].map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all',
                step > s.n ? 'bg-[#2D7A4F] text-white' : step === s.n ? 'bg-[#1A1A1A] text-white' : 'bg-[#E8E5E0] text-[#6B6B6B]'
              )}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={clsx('ml-2 text-sm font-medium hidden sm:block', step >= s.n ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]')}>
                {s.label}
              </span>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-[#E8E5E0] mx-3" />}
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-[#E8E5E0] rounded-full overflow-hidden">
          <div className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── STEP 1: PHOTOS ────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-1">Fotos de la prenda</h2>
          <p className="text-sm text-[#6B6B6B] mb-5">Mínimo 1 foto · Máximo 6 · JPG, PNG o WebP · Máx. 10MB</p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
              isDragActive ? 'border-[#C8B89A] bg-[#C8B89A]/5' : 'border-[#E8E5E0] hover:border-[#C8B89A] hover:bg-[#F5F3F0]/50',
              aiPhase === 'processing-image' && 'pointer-events-none opacity-60'
            )}
          >
            <input {...getInputProps()} />
            <svg className="w-10 h-10 text-[#C8B89A] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {isDragActive ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">ReVibe mejorará automáticamente las imágenes con IA</p>
          </div>

          {/* Image gallery with before/after toggle */}
          {form.originalUrls.length > 0 && (
            <div className="mt-5">
              {/* Main preview */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F3F0] mb-3 max-w-xs mx-auto">
                {currentDisplayUrl && (
                  <img src={currentDisplayUrl} alt="" className="w-full h-full object-cover transition-all duration-300" />
                )}

                {/* Processing overlay */}
                {aiPhase === 'processing-image' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-white text-sm font-medium">Procesando con IA...</p>
                  </div>
                )}

                {/* Before/after toggle */}
                {aiPhase === 'done' && form.processedUrls[selectedImageIndex] && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex bg-black/70 rounded-full p-0.5 gap-0.5">
                    <button
                      onClick={() => setShowProcessed(false)}
                      className={clsx('text-xs px-3 py-1 rounded-full transition-colors', !showProcessed ? 'bg-white text-[#1A1A1A]' : 'text-white')}
                    >Original</button>
                    <button
                      onClick={() => setShowProcessed(true)}
                      className={clsx('text-xs px-3 py-1 rounded-full transition-colors', showProcessed ? 'bg-white text-[#1A1A1A]' : 'text-white')}
                    >IA ✨</button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 justify-center flex-wrap">
                {form.originalUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <button
                      onClick={() => setSelectedImageIndex(idx)}
                      className={clsx(
                        'w-14 h-18 rounded overflow-hidden border-2 transition-all block',
                        selectedImageIndex === idx ? 'border-[#1A1A1A]' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                      style={{ height: '4.5rem' }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute -top-1 -left-1 text-xs bg-[#1A1A1A] text-white px-1 rounded leading-4">★</span>
                    )}
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-[#C0392B] text-white rounded-full flex items-center justify-center text-xs leading-none"
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* AI processing status */}
              {aiPhase === 'done' && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-[#2D7A4F]/5 border border-[#2D7A4F]/20 rounded-lg">
                  <span className="text-[#2D7A4F] text-lg mt-0.5">✓</span>
                  <div className="text-sm text-[#2D7A4F]">
                    <p className="font-medium">Imágenes procesadas por IA</p>
                    <p className="text-xs opacity-80 mt-0.5">Contraste mejorado · Brillo optimizado · Lista para publicar</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button
              fullWidth size="lg"
              disabled={form.images.length === 0 || aiPhase === 'processing-image'}
              loading={aiPhase === 'processing-image'}
              onClick={() => setStep(2)}
            >
              {aiPhase === 'processing-image'
                ? 'Procesando imágenes...'
                : `Continuar con ${form.images.length} foto${form.images.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: INFORMATION + AI ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
            <h2 className="font-semibold text-[#1A1A1A] mb-5">Información de la prenda</h2>

            <div className="space-y-5">
              {/* Gender */}
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">Género</p>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((g) => (
                    <button key={g.value} type="button"
                      onClick={() => setForm({ ...form, gender: g.value })}
                      className={clsx(
                        'p-3 rounded-lg border-2 text-center transition-all',
                        form.gender === g.value ? 'border-[#1A1A1A] bg-[#F5F3F0]' : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                      )}
                    >
                      <span className="text-2xl block">{g.label}</span>
                      <span className="text-xs font-medium mt-1 block">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Título de la prenda *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                error={errors.title}
                placeholder="Ej: Blazer negro estructurado"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Marca</label>
                  <input
                    list="brands-list"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Busca o escribe..."
                    className="w-full border border-[#E8E5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                  />
                  <datalist id="brands-list">
                    {POPULAR_BRANDS.map((b) => <option key={b} value={b} />)}
                  </datalist>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Estado *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className={clsx(
                      'w-full border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8B89A]',
                      errors.condition ? 'border-[#C0392B]' : 'border-[#E8E5E0]'
                    )}
                  >
                    <option value="">Selecciona el estado</option>
                    {Object.entries(CONDITION_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  {form.condition && (
                    <p className="text-xs text-[#6B6B6B] mt-1">{CONDITION_DESCRIPTIONS[form.condition]}</p>
                  )}
                  {errors.condition && <p className="text-xs text-[#C0392B] mt-1">{errors.condition}</p>}
                </div>
              </div>

              {/* AI Analyze button */}
              {form.title && form.condition && !aiResult && (
                <div className="flex items-center gap-3 p-3 bg-[#F5F3F0] rounded-lg border border-[#E8E5E0]">
                  <span className="text-2xl">✨</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">Analizar con IA</p>
                    <p className="text-xs text-[#6B6B6B]">Genera descripción, precio sugerido y vibe automáticamente</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={runAIAnalysis}
                    loading={aiPhase === 'analyzing'}
                    disabled={aiPhase === 'analyzing'}
                  >
                    {aiPhase === 'analyzing' ? 'Analizando...' : 'Analizar'}
                  </Button>
                </div>
              )}

              {/* AI Results Panel */}
              {aiPhase === 'analyzing' && (
                <div className="border border-[#C8B89A]/40 bg-[#C8B89A]/5 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="animate-spin w-5 h-5 text-[#C8B89A]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">IA analizando tu prenda...</p>
                      <p className="text-xs text-[#6B6B6B]">Generando descripción · Calculando precio · Detectando vibe</p>
                    </div>
                  </div>
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-[#C8B89A]/30 rounded w-full" />
                    <div className="h-3 bg-[#C8B89A]/30 rounded w-5/6" />
                    <div className="h-3 bg-[#C8B89A]/30 rounded w-4/6" />
                  </div>
                </div>
              )}

              {aiResult && (
                <div className="border border-[#C8B89A]/40 bg-[#C8B89A]/5 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">Análisis de IA — ReVibe</span>
                    </div>
                    <button
                      onClick={() => { setAiResult(null); setAiPhase('done'); }}
                      className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] underline"
                    >
                      Reanalizar
                    </button>
                  </div>

                  {/* Suggested description */}
                  <div className="bg-white rounded-lg p-4 border border-[#E8E5E0]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Descripción generada</p>
                      <button
                        onClick={() => applyAISuggestion('description')}
                        className="text-xs text-[#1A1A1A] underline font-medium hover:text-[#C8B89A] transition-colors"
                      >
                        {form.description === aiResult.description ? '✓ Aplicada' : 'Usar esta →'}
                      </button>
                    </div>
                    <p className="text-sm text-[#6B6B6B] italic leading-relaxed">"{aiResult.description}"</p>
                  </div>

                  {/* Price suggestion */}
                  <div className="bg-white rounded-lg p-4 border border-[#E8E5E0]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Precio sugerido</p>
                      <button
                        onClick={() => applyAISuggestion('price')}
                        className="text-xs text-[#1A1A1A] underline font-medium hover:text-[#C8B89A] transition-colors"
                      >
                        {form.price === aiResult.suggestedPrice.toString() ? '✓ Aplicado' : 'Usar este →'}
                      </button>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-xl font-bold text-[#1A1A1A]">{formatCOP(aiResult.suggestedPrice)}</span>
                      <span className="text-xs text-[#6B6B6B]">
                        Rango: {formatCOP(aiResult.priceRangeMin)} – {formatCOP(aiResult.priceRangeMax)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{aiResult.priceReasoning}</p>
                  </div>

                  {/* Vibe + Size row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-[#E8E5E0]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Vibe detectado</p>
                        <button
                          onClick={() => applyAISuggestion('vibe')}
                          className="text-xs text-[#1A1A1A] underline font-medium hover:text-[#C8B89A]"
                        >
                          {form.vibe === aiResult.suggestedVibe ? '✓' : 'Usar →'}
                        </button>
                      </div>
                      <p className="font-medium text-[#1A1A1A]">{aiResult.suggestedVibe}</p>
                      <p className="text-xs text-[#6B6B6B]">{aiResult.vibeConfidence}% confianza</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-[#E8E5E0]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Talla sugerida</p>
                        <button
                          onClick={() => applyAISuggestion('size')}
                          className="text-xs text-[#1A1A1A] underline font-medium hover:text-[#C8B89A]"
                        >
                          {form.size === aiResult.suggestedSize ? '✓' : 'Usar →'}
                        </button>
                      </div>
                      <p className="font-medium text-[#1A1A1A]">{aiResult.suggestedSize}</p>
                      <p className="text-xs text-[#6B6B6B]">Basada en análisis</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description textarea */}
              <Textarea
                label="Descripción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={aiResult ? 'Acepta la descripción de IA o escribe la tuya...' : 'Describe la prenda: tela, corte, estado, ocasión de uso...'}
                rows={4}
                maxLength={500}
                currentLength={form.description.length}
              />

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                  Talla
                  {aiResult?.suggestedSize && form.size !== aiResult.suggestedSize && (
                    <button onClick={() => applyAISuggestion('size')} className="ml-2 text-xs text-[#C8B89A] underline">
                      IA sugiere {aiResult.suggestedSize}
                    </button>
                  )}
                </label>
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="w-full border border-[#E8E5E0] rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                >
                  <option value="">Seleccionar talla</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Price */}
              <div>
                <Input
                  label="Precio (COP) *"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  error={errors.price}
                  placeholder="Ej: 85000"
                  min="1000"
                />
                {form.price && !isNaN(Number(form.price)) && Number(form.price) >= 1000 && (
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Se mostrará como:{' '}
                    <span className="font-mono font-semibold text-[#1A1A1A]">{formatCOP(Number(form.price))}</span>
                  </p>
                )}
              </div>

              {/* Vibe chips */}
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">
                  Vibe
                  {aiResult && (
                    <span className="ml-2 text-xs text-[#C8B89A] font-normal">
                      IA detectó: {aiResult.suggestedVibe} ({aiResult.vibeConfidence}%)
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((v) => (
                    <button
                      key={v} type="button"
                      onClick={() => setForm({ ...form, vibe: form.vibe === v ? '' : v })}
                      className={clsx(
                        'px-3 py-1.5 text-sm rounded border transition-all',
                        form.vibe === v
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : aiResult?.suggestedVibe === v
                          ? 'border-[#C8B89A] text-[#A09070] bg-[#C8B89A]/10'
                          : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                      )}
                    >
                      {v} {aiResult?.suggestedVibe === v && form.vibe !== v && '✨'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setStep(1)}>Volver</Button>
                <Button fullWidth onClick={handleStep2Next} loading={aiPhase === 'analyzing'}>
                  {aiPhase === 'analyzing' ? 'Analizando con IA...' : 'Revisar prenda →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: REVIEW ────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
            <h2 className="font-semibold text-[#1A1A1A] mb-5">Revisión final</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Preview card */}
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2 font-medium">Así se verá en el catálogo</p>
                <div className="border border-[#E8E5E0] rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-[3/4] bg-[#F5F3F0]">
                    {(form.processedUrls[0] || form.originalUrls[0]) ? (
                      <img
                        src={form.processedUrls[0] || form.originalUrls[0]}
                        alt="" className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-20">📷</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-[#E8E5E0]">
                    {form.brand && <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">{form.brand}</p>}
                    <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 mt-0.5">{form.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {form.size && <span className="text-xs bg-[#C8B89A]/20 text-[#A09070] px-1.5 py-0.5 rounded">{form.size}</span>}
                      <span className="font-mono text-sm font-bold">{form.price ? formatCOP(Number(form.price)) : '—'}</span>
                    </div>
                  </div>
                </div>
                {form.processedUrls[0] && (
                  <p className="text-xs text-[#2D7A4F] mt-2 text-center">✓ Imagen procesada por IA</p>
                )}
              </div>

              {/* Data summary */}
              <div className="space-y-2.5">
                {[
                  { label: 'Título', value: form.title },
                  { label: 'Precio', value: form.price ? formatCOP(Number(form.price)) : '—', mono: true },
                  { label: 'Marca', value: form.brand || '—' },
                  { label: 'Talla', value: form.size || '—' },
                  { label: 'Estado', value: form.condition ? CONDITION_LABELS[form.condition] : '—' },
                  { label: 'Vibe', value: form.vibe || aiResult?.suggestedVibe || '—' },
                  { label: 'Género', value: form.gender },
                  { label: 'Fotos', value: `${form.images.length} foto(s)` },
                  ...(aiResult ? [{ label: 'IA usada', value: '✓ Descripción y precio' }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-[#F5F3F0] pb-2 last:border-0">
                    <span className="text-[#6B6B6B]">{row.label}</span>
                    <span className={clsx('font-medium text-[#1A1A1A] text-right max-w-[60%] truncate', row.mono && 'font-mono')}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description preview */}
            {form.description && (
              <div className="mt-5 p-4 bg-[#F5F3F0] rounded-lg">
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2 font-medium">Descripción</p>
                <p className="text-sm text-[#6B6B6B] italic leading-relaxed">"{form.description}"</p>
              </div>
            )}

            {/* Info banner */}
            <div className="mt-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-500 mt-0.5">⏳</span>
              <div className="text-sm">
                <p className="font-medium text-amber-800">Pendiente de aprobación</p>
                <p className="text-amber-700 mt-0.5">
                  El equipo de ReVibe revisará tu prenda y la publicará en el catálogo en un plazo de 24–48 horas.
                </p>
              </div>
            </div>

            {/* Agreement */}
            <div className="mt-5 p-4 bg-[#F5F3F0] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#1A1A1A]"
                />
                <span className="text-sm text-[#6B6B6B] leading-relaxed">
                  Confirmo que la prenda está en el estado descrito, las fotos son reales y acepto los{' '}
                  <a href="#" className="text-[#1A1A1A] underline">términos de consignación</a> de ReVibe.
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="secondary" onClick={() => setStep(2)}>Editar</Button>
              <Button fullWidth size="lg" onClick={handleSubmit} loading={submitting} disabled={!agreed}>
                Enviar para revisión →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
