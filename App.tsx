import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TrainingPanel } from './components/TrainingPanel';
import { PredictionPanel } from './components/PredictionPanel';
import { Methodology } from './components/Methodology';
import { AppStep, ModelConfig, ModelMetrics, DetectionData } from './types';

const App: React.FC = () => {
  const [currentStep, setStep] = useState<AppStep>(AppStep.UPLOAD_TRAIN);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    blurRadius: 2,
    roiSize: 0.5,
    targetChannel: 'G/R'
  });
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);

  const handleModelTrained = (metrics: ModelMetrics, data: DetectionData[]) => {
      setModelMetrics(metrics);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar currentStep={currentStep} setStep={setStep} />
      
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    {currentStep === AppStep.UPLOAD_TRAIN && "Model Configuration & Training"}
                    {currentStep === AppStep.PREDICT && "Pathogen Detection"}
                    {currentStep === AppStep.REPORT && "Methodology"}
                </h2>
                <p className="text-slate-400 mt-1">
                    {currentStep === AppStep.UPLOAD_TRAIN && "Upload calibration images to build your detection curve."}
                    {currentStep === AppStep.PREDICT && "Analyze new samples using the trained deep learning model."}
                    {currentStep === AppStep.REPORT && "Technical details of the algorithm."}
                </p>
            </div>
            
            {modelMetrics && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-400">Model Active (R²: {modelMetrics.rSquared.toFixed(2)})</span>
                </div>
            )}
        </header>

        <div className="max-w-7xl mx-auto">
            {currentStep === AppStep.UPLOAD_TRAIN && (
                <TrainingPanel 
                    config={modelConfig} 
                    setConfig={setModelConfig} 
                    onModelTrained={handleModelTrained} 
                />
            )}
            
            {currentStep === AppStep.PREDICT && (
                <PredictionPanel 
                    config={modelConfig} 
                    modelMetrics={modelMetrics} 
                />
            )}

            {currentStep === AppStep.REPORT && (
                <Methodology />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;