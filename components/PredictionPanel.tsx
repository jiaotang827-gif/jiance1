import React, { useState } from 'react';
import { DetectionData, ModelConfig, ModelMetrics } from '../types';
import { processImage } from '../services/imageProcessing';
import { analyzeImageQuality, generateScientificReport } from '../services/geminiService';
import { Upload, Camera, AlertTriangle, Loader2, Sparkles, FileBarChart } from 'lucide-react';

interface PredictionPanelProps {
  config: ModelConfig;
  modelMetrics: ModelMetrics | null;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ config, modelMetrics }) => {
  const [sample, setSample] = useState<DetectionData | null>(null);
  const [qualityCheck, setQualityCheck] = useState<any>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePredict = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!modelMetrics) {
        alert("Please train the model first!");
        return;
    }

    setIsAnalyzing(true);
    setSample(null);
    setAiReport('');
    setQualityCheck(null);

    const file = e.target.files[0];

    try {
        // 1. Process RGB
        const data = await processImage(file, config);
        
        // 2. Predict Concentration
        // y = mx + b  =>  x = (y - b) / m
        const y = data.grRatio;
        const x = (y - modelMetrics.intercept) / modelMetrics.slope;
        
        // Handle negative predictions (noise floor)
        data.predictedConcentration = Math.max(0, x);
        
        setSample(data);

        // 3. AI Quality Check (Simulated async)
        const reader = new FileReader();
        reader.onloadend = async () => {
             const base64 = (reader.result as string).split(',')[1];
             
             // Parallel AI tasks
             const [qualityRes, reportRes] = await Promise.all([
                 analyzeImageQuality(base64),
                 generateScientificReport(data, modelMetrics)
             ]);

             setQualityCheck(qualityRes);
             setAiReport(reportRes);
             setIsAnalyzing(false);
        };
        reader.readAsDataURL(file);

    } catch (err) {
        console.error(err);
        setIsAnalyzing(false);
    }
  };

  if (!modelMetrics) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
              <AlertTriangle size={48} className="mb-4 text-amber-500" />
              <p className="text-lg font-medium text-slate-300">Model Not Trained</p>
              <p className="max-w-md text-center mt-2">Please go to the "Data & Model" tab and train the system with standard samples before running predictions.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                 <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Camera className="text-emerald-500" size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Analyze Sample</h2>
                 <p className="text-slate-400 mb-6">Upload a photo of the TMB reaction result.</p>
                 
                 <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-all shadow-lg shadow-emerald-900/20">
                    {isAnalyzing ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}
                    <span>{isAnalyzing ? 'Processing...' : 'Upload Image'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePredict} disabled={isAnalyzing} />
                 </label>
            </div>

            {/* Live Preview */}
            {sample && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group">
                    <img src={sample.url} alt="Analysis" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-emerald-400/50 w-[50%] h-[50%] rounded-lg relative">
                            <span className="absolute -top-6 left-0 text-xs text-emerald-400 bg-slate-900/80 px-2 py-1 rounded">Analysis ROI</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
            {sample && !isAnalyzing && (
                <>
                    {/* Primary Metric */}
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <h3 className="text-emerald-400 text-sm uppercase tracking-wider font-semibold mb-1">Detected Concentration</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white tracking-tight">
                                {sample.predictedConcentration?.toFixed(2)}
                            </span>
                            <span className="text-lg text-emerald-200/60 font-medium">units</span>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-emerald-200/50">
                            <div>
                                <span className="block text-xs uppercase">G/R Ratio</span>
                                <span className="font-mono text-emerald-300">{sample.grRatio.toFixed(3)}</span>
                            </div>
                            <div className="h-8 w-px bg-emerald-500/20"></div>
                            <div>
                                <span className="block text-xs uppercase">Green Channel</span>
                                <span className="font-mono text-emerald-300">{Math.round(sample.g)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-purple-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">Deep Learning Insight</h3>
                        </div>
                        
                        {qualityCheck && (
                            <div className={`mb-4 p-3 rounded-lg border text-sm ${qualityCheck.quality === 'good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}`}>
                                <p className="font-semibold">Image Quality: {qualityCheck.quality === 'good' ? 'Pass' : 'Warning'}</p>
                                {qualityCheck.issue && <p className="opacity-80 mt-1">{qualityCheck.issue}</p>}
                            </div>
                        )}

                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                {aiReport || "Generating scientific interpretation..."}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};