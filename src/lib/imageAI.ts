// Simulated AI image processing (fallback mode)
export interface ProcessedImageResult {
  processedUrl: string;
  suggestedSize: string;
  suggestedCategory: string;
  confidence: number;
  demoMode: boolean;
}

export const processGarmentImage = async (imageUrl: string): Promise<ProcessedImageResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const categories = ['Prendas Superiores', 'Prendas Inferiores', 'Accesorios'];
  return {
    processedUrl: imageUrl,
    suggestedSize: sizes[Math.floor(Math.random() * sizes.length)],
    suggestedCategory: categories[Math.floor(Math.random() * categories.length)],
    confidence: 0.75 + Math.random() * 0.2,
    demoMode: true,
  };
};
