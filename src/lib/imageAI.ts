// Image processing — canvas-based enhancement + simulated background removal
// In production: call Remove.bg API via a Supabase Edge Function

export interface ProcessedImageResult {
  processedUrl: string;
  originalUrl: string;
  demoMode: boolean;
}

async function applyCanvasFilters(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(url); return; }

      ctx.filter = 'contrast(1.08) brightness(1.05) saturate(1.12)';
      ctx.drawImage(img, 0, 0);

      // Subtle vignette-reverse: lighten edges to simulate white background
      ctx.filter = 'none';
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.35,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.72
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(255,255,255,0.18)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export async function processGarmentImage(file: File): Promise<ProcessedImageResult> {
  const originalUrl = URL.createObjectURL(file);
  const [processedUrl] = await Promise.all([
    applyCanvasFilters(file),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  return { processedUrl, originalUrl, demoMode: true };
}
