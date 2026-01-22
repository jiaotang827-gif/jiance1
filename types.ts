export interface DetectionData {
  id: string;
  url: string;
  name: string;
  concentration?: number; // User provided true concentration (for training)
  predictedConcentration?: number;
  r: number;
  g: number;
  b: number;
  grRatio: number;
  split?: 'train' | 'test' | 'prediction';
}

export interface ModelMetrics {
  slope: number;
  intercept: number;
  rSquared: number;
  rmse: number;
  trainedAt: string;
}

export interface ModelConfig {
  blurRadius: number; // For denoising
  roiSize: number; // Percentage of center crop (0.1 to 1.0)
  targetChannel: 'G/R' | 'G/B' | 'Intensity';
}

export enum AppStep {
  UPLOAD_TRAIN = 'UPLOAD_TRAIN',
  TRAINING = 'TRAINING',
  PREDICT = 'PREDICT',
  REPORT = 'REPORT'
}