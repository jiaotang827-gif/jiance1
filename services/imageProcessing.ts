import { DetectionData, ModelConfig } from '../types';

/**
 * Loads an image from a URL into an HTMLImageElement
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Processes an image to extract RGB data, applying denoising and ROI cropping.
 */
export const processImage = async (
  file: File,
  config: ModelConfig
): Promise<DetectionData> => {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas to image size
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw original
  ctx.drawImage(img, 0, 0);

  // 1. Denoising / Preprocessing (Simple Box Blur simulation)
  // In a real "Deep Learning" pipeline, this might be a Wiener filter or Gaussian.
  // Here we use canvas filter if supported, or skip.
  if (config.blurRadius > 0) {
    ctx.filter = `blur(${config.blurRadius}px)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none'; // Reset
  }

  // 2. ROI Extraction (Center Crop)
  const roiWidth = img.width * config.roiSize;
  const roiHeight = img.height * config.roiSize;
  const startX = (img.width - roiWidth) / 2;
  const startY = (img.height - roiHeight) / 2;

  const imageData = ctx.getImageData(startX, startY, roiWidth, roiHeight);
  const data = imageData.data;

  // 3. RGB Analysis
  let rTotal = 0, gTotal = 0, bTotal = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    rTotal += data[i];
    gTotal += data[i + 1];
    bTotal += data[i + 2];
  }

  const r = rTotal / pixelCount;
  const g = gTotal / pixelCount;
  const b = bTotal / pixelCount;
  
  // Calculate Dual-Mode Signal (G/R is typical for TMB + Nano fluorescence)
  const grRatio = r === 0 ? 0 : g / r;

  return {
    id: crypto.randomUUID(),
    url,
    name: file.name,
    r,
    g,
    b,
    grRatio
  };
};

/**
 * Simple Linear Regression (Least Squares)
 * y = mx + b
 */
export const trainLinearModel = (data: DetectionData[]) => {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0, rmse: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  // X = Concentration (Label), Y = Signal (G/R Ratio)
  // Note: Usually we want Concentration = f(Signal), so we might swap X and Y for the prediction formula.
  // Standard Curve: Signal (Y) vs Concentration (X).
  // Prediction: X = (Y - b) / m.

  for (const point of data) {
    const x = point.concentration || 0;
    const y = point.grRatio;
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R Squared Calculation
  const ssTot = data.reduce((acc, p) => acc + Math.pow(p.grRatio - (sumY / n), 2), 0);
  const ssRes = data.reduce((acc, p) => acc + Math.pow(p.grRatio - (slope * (p.concentration || 0) + intercept), 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  // RMSE
  const mse = ssRes / n;
  const rmse = Math.sqrt(mse);

  return { slope, intercept, rSquared, rmse };
};