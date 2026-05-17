import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { processGarmentImage } from '../../lib/imageAI';
import { formatCOP, SIZES, CONDITION_LABELS, VIBE_OPTIONS, POPULAR_BRANDS } from '../../lib/formatters';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

type Step = 1 | 2 | 3;

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
  imagePreviewUrls: string[];
  aiSuggestedSize: string;
}

const GENDER_OPTIONS = [
  { value: 'mujer', label: '👗 Mujer', desc: 'Prendas femeninas' },
  { value: 'hombre', label: '👔 Hombre', desc: 'Prendas masculinas' },
  { value: 'unisex', label: '✨ Unisex', desc: 'Para todos' },
];

export function UploadProduct() {
  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    brand: '',
    size: '',
    condition: '',
    price: '',
    vibe: '',
    gender: 'mujer',
    images: [],
    imagePreviewUrls: [],
    aiSuggestedSize: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newPreviews = acceptedFiles.map((f) => URL.createObjectURL(f));
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles].slice(0, 6),
        imagePreviewUrls: [...prev.imagePreviewUrls, ...newPreviews].slice(0, 6),
      }));

      // Simulate AI processing
      if (acceptedFiles.length > 0) {
        setProcessing(true);
        try {
          const result = await processGarmentImage(newPreviews[0]);
          setForm((prev) => ({ ...prev, aiSuggestedSize: result.suggestedSize }));
          setProcessed(true);
        } finally {
          setProcessing(false);
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 6,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imagePreviewUrls: prev.imagePreviewUrls.filter((_, i) => i !== idx),
    }));
    if (form.images.length <= 1) setProcessed(false);
  };

  const validateStep2 = () => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'El título es requerido';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = 'El precio debe ser un número válido';
    if (!form.condition) newErrors.condition = 'Selecciona el estado';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep2Next = () => {
    if (!validateStep2()) return;
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast('Debes aceptar los términos', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from('garments').insert({
        seller_id: user?.id || 'demo',
        title: form.title,
        description: form.description || null,
        brand: form.brand || null,
        size: form.size || null,
        condition: form.condition || null,
        price: Number(form.price),
        vibe: form.vibe || null,
        status: 'en_revision',
        images: [],
        images_processed: processed,
        ai_suggested_size: form.aiSuggestedSize || null,
      });
      toast('Prenda enviada para revisión', 'success');
      navigate('/vendedor');
    } catch {
      // Demo mode: just navigate
      toast('Prenda enviada para revisión (modo demo)', 'success');
      navigate('/vendedor');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-2">Consignar prenda</h1>
        <p className="text-sm text-[#6B6B6B]">Completa los pasos para publicar tu prenda</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[
            { n: 1, label: 'Fotos' },
            { n: 2, label: 'Información' },
            { n: 3, label: 'Revisión' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step >= s.n ? 'bg-[#1A1A1A] text-white' : 'bg-[#E8E5E0] text-[#6B6B6B]'
                )}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span
                className={clsx(
                  'text-sm font-medium hidden sm:block',
                  step >= s.n ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-[#E8E5E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-2">Fotos de la prenda</h2>
          <p className="text-sm text-[#6B6B6B] mb-5">
            Agrega entre 1 y 6 fotos. La primera será la imagen principal.
          </p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-[#C8B89A] bg-[#C8B89A]/5' : 'border-[#E8E5E0] hover:border-[#C8B89A]'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-[#C8B89A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {isDragActive ? 'Suelta las fotos aquí' : 'Arrastra fotos o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-1">JPG, PNG, WebP — máx. 10MB por foto</p>
              </div>
            </div>
          </div>

          {/* Image previews */}
          {form.imagePreviewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {form.imagePreviewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F3F0]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 text-xs bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-[#C0392B] text-white rounded-full flex items-center justify-center text-xs hover:bg-[#a93226] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Processing indicator */}
          {processing && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-[#F5F3F0] rounded-lg">
              <svg className="animate-spin w-4 h-4 text-[#C8B89A]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-[#6B6B6B]">Procesando imagen con IA...</p>
            </div>
          )}

          {processed && !processing && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-[#2D7A4F]/5 border border-[#2D7A4F]/20 rounded-lg">
              <span className="text-[#2D7A4F]">✓</span>
              <p className="text-sm text-[#2D7A4F]">
                ¡Listo para publicar! Talla sugerida: <strong>{form.aiSuggestedSize}</strong>
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button
              fullWidth
              size="lg"
              disabled={form.images.length === 0}
              onClick={() => setStep(2)}
            >
              Continuar con {form.images.length} foto{form.images.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Information */}
      {step === 2 && (
        <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-5">Información de la prenda</h2>

          <div className="space-y-5">
            {/* Gender */}
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-2">Género</p>
              <div className="grid grid-cols-3 gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g.value })}
                    className={clsx(
                      'p-3 rounded-lg border-2 text-center transition-all',
                      form.gender === g.value
                        ? 'border-[#1A1A1A] bg-[#F5F3F0]'
                        : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                    )}
                  >
                    <span className="text-xl block mb-1">{g.label.split(' ')[0]}</span>
                    <span className="text-xs font-medium">{g.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Título de la prenda *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
              placeholder="Ej: Blusa de seda vintage tono camel"
            />

            <Textarea
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe la prenda: tela, corte, estado real, ocasión de uso..."
              rows={4}
              maxLength={500}
              currentLength={form.description.length}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Marca</label>
                <input
                  list="brands-list"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Busca o escribe una marca"
                  className="w-full border border-[#E8E5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                />
                <datalist id="brands-list">
                  {POPULAR_BRANDS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                  Talla
                  {form.aiSuggestedSize && (
                    <span className="ml-2 text-xs text-[#C8B89A]">
                      IA sugiere: {form.aiSuggestedSize}
                    </span>
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
            </div>

            <Select
              label="Estado *"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              error={errors.condition}
              options={Object.entries(CONDITION_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Selecciona el estado de la prenda"
            />

            <Input
              label="Precio (COP) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
              placeholder="Ej: 85000"
              min="1000"
            />
            {form.price && !isNaN(Number(form.price)) && Number(form.price) > 0 && (
              <p className="text-xs text-[#6B6B6B] -mt-3">
                Se mostrará como: <span className="font-mono font-semibold text-[#1A1A1A]">{formatCOP(Number(form.price))}</span>
              </p>
            )}

            {/* Vibe */}
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-2">Vibe (estilo)</p>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, vibe: form.vibe === v ? '' : v })}
                    className={clsx(
                      'px-3 py-1.5 text-sm rounded border transition-all',
                      form.vibe === v
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button fullWidth onClick={handleStep2Next}>
                Revisar prenda
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E5E0] rounded-lg p-6">
            <h2 className="font-semibold text-[#1A1A1A] mb-4">Revisión final</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Preview card */}
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2">Así se verá en el catálogo</p>
                <div className="border border-[#E8E5E0] rounded-lg overflow-hidden">
                  <div className="aspect-[3/4] bg-[#F5F3F0]">
                    {form.imagePreviewUrls[0] ? (
                      <img src={form.imagePreviewUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {form.brand && <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">{form.brand}</p>}
                    <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2">{form.title}</p>
                    <p className="font-mono text-sm font-bold mt-1">{form.price ? formatCOP(Number(form.price)) : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Summary table */}
              <div className="space-y-3">
                {[
                  { label: 'Título', value: form.title },
                  { label: 'Precio', value: form.price ? formatCOP(Number(form.price)) : '—' },
                  { label: 'Marca', value: form.brand || '—' },
                  { label: 'Talla', value: form.size || '—' },
                  { label: 'Estado', value: form.condition ? CONDITION_LABELS[form.condition] : '—' },
                  { label: 'Vibe', value: form.vibe || '—' },
                  { label: 'Género', value: form.gender },
                  { label: 'Fotos', value: `${form.images.length} foto(s)` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-[#F5F3F0] pb-2">
                    <span className="text-[#6B6B6B]">{row.label}</span>
                    <span className="font-medium text-[#1A1A1A] text-right max-w-[60%] truncate">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <div className="mt-6 p-4 bg-[#F5F3F0] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#1A1A1A]"
                />
                <span className="text-sm text-[#6B6B6B] leading-relaxed">
                  Confirmo que la prenda está en el estado descrito y acepto los{' '}
                  <a href="#" className="text-[#1A1A1A] underline">términos de consignación</a> de ReVibe.
                  Entiendo que la prenda será revisada antes de publicarse.
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Editar información
              </Button>
              <Button
                fullWidth
                onClick={handleSubmit}
                loading={submitting}
                disabled={!agreed}
              >
                Enviar para revisión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
