import React, { useState, useCallback } from 'react';
import { DetectionData, ModelConfig, ModelMetrics } from '../types';
import { processImage, trainLinearModel } from '../services/imageProcessing';
import { Upload, Trash2, Play, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface TrainingPanelProps {
  config: ModelConfig;
  setConfig: (c: ModelConfig) => void;
  onModelTrained: (metrics: ModelMetrics, trainingData: DetectionData[]) => void;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ config, setConfig, onModelTrained }) => {
  const [images, setImages] = useState<DetectionData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsProcessing(true);
      const newImages: DetectionData[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const data = await processImage(file, config);
          // Auto-assign mock concentration if filename contains a number for demo purposes
          const numberMatch = file.name.match(/(\d+(\.\d+)?)/);
          if (numberMatch) {
              data.concentration = parseFloat(numberMatch[0]);
          }
          newImages.push(data);
        } catch (err) {
          console.error(err);
        }
      }
      setImages(prev => [...prev, ...newImages]);
      setIsProcessing(false);
    }
  };

  const updateConcentration = (id: string, val: string) => {
    const num = parseFloat(val);
    setImages(prev => prev.map(img => img.id === id ? { ...img, concentration: isNaN(num) ? 0 : num } : img));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const runTraining = () => {
    if (images.length < 3) {
      alert("Need at least 3 images to train.");
      return;
    }
    
    // Shuffle and Split 70/30
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const splitIndex = Math.floor(shuffled.length * 0.7);
    
    const trainSet = shuffled.slice(0, splitIndex).map(i => ({...i, split: 'train' as const}));
    const testSet = shuffled.slice(splitIndex).map(i => ({...i, split: 'test' as const}));
    
    // Train on 70%
    const result = trainLinearModel(trainSet);
    
    const newMetrics = {
        ...result,
        trainedAt: new Date().toISOString()
    };
    
    setMetrics(newMetrics);
    
    // Combine back for display
    const finalData = [...trainSet, ...testSet];
    setImages(finalData);
    
    onModelTrained(newMetrics, finalData);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload & Config Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-emerald-500" />
                    Dataset Upload
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    Upload images of standard solutions. Filenames containing numbers (e.g., "100cfu.jpg") will be auto-labeled.
                </p>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="text-sm text-slate-400"><span className="font-semibold text-emerald-400">Click to upload</span> folder or images</p>
                    </div>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                </label>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pre-processing Config</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Denoising (Blur Radius)</label>
                        <input 
                            type="range" min="0" max="10" step="0.5" 
                            value={config.blurRadius}
                            onChange={(e) => setConfig({...config, blurRadius: parseFloat(e.target.value)})}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>None</span>
                            <span>{config.blurRadius}px</span>
                            <span>High</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">ROI Crop Size</label>
                        <input 
                            type="range" min="0.1" max="1.0" step="0.1" 
                            value={config.roiSize}
                            onChange={(e) => setConfig({...config, roiSize: parseFloat(e.target.value)})}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>10%</span>
                            <span>{Math.round(config.roiSize * 100)}%</span>
                            <span>Full</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Data Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[500px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Training Data ({images.length})</h3>
                <button 
                    onClick={runTraining}
                    disabled={images.length < 3}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Play size={18} fill="currentColor" />
                    Train Model
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="text-xs text-slate-500 border-b border-slate-800 uppercase tracking-wider">
                             <th className="py-2">Preview</th>
                             <th className="py-2">Concentration (X)</th>
                             <th className="py-2">G/R Ratio (Y)</th>
                             <th className="py-2">Set</th>
                             <th className="py-2 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm">
                         {images.map((img) => (
                             <tr key={img.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                 <td className="py-2">
                                     <img src={img.url} alt="thumbnail" className="w-10 h-10 object-cover rounded bg-slate-800" />
                                 </td>
                                 <td className="py-2">
                                     <input 
                                        type="number" 
                                        value={img.concentration || ''} 
                                        onChange={(e) => updateConcentration(img.id, e.target.value)}
                                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-24 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                        placeholder="0.00"
                                     />
                                 </td>
                                 <td className="py-2 font-mono text-emerald-400">
                                     {img.grRatio.toFixed(3)}
                                 </td>
                                 <td className="py-2">
                                     {img.split === 'train' && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Train</span>}
                                     {img.split === 'test' && <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">Test</span>}
                                     {!img.split && <span className="text-slate-600">-</span>}
                                 </td>
                                 <td className="py-2 text-right">
                                     <button onClick={() => removeImage(img.id)} className="text-slate-500 hover:text-red-400 p-1">
                                         <Trash2 size={16} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                         {images.length === 0 && (
                             <tr>
                                 <td colSpan={5} className="py-8 text-center text-slate-500">
                                     No data uploaded yet.
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
        </div>
      </div>

      {/* Results Section */}
      {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Standard Curve (Regression)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" dataKey="concentration" name="Concentration" stroke="#94a3b8" label={{ value: 'Concentration', position: 'bottom', fill: '#94a3b8' }} />
                            <YAxis type="number" dataKey="grRatio" name="G/R Ratio" stroke="#94a3b8" label={{ value: 'G/R Ratio', angle: -90, position: 'left', fill: '#94a3b8' }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                            <Legend />
                            <Scatter name="Training Data" data={images.filter(i => i.split === 'train')} fill="#3b82f6" shape="circle" />
                            <Scatter name="Test Data" data={images.filter(i => i.split === 'test')} fill="#f59e0b" shape="triangle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Model Performance</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <p className="text-sm text-slate-400 mb-1">R-Squared (Accuracy)</p>
                          <div className="flex items-end gap-2">
                              <span className={`text-4xl font-bold ${metrics.rSquared > 0.9 ? 'text-emerald-400' : metrics.rSquared > 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {metrics.rSquared.toFixed(3)}
                              </span>
                              <span className="text-sm text-slate-500 mb-1">/ 1.0</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 p-3 rounded-lg">
                              <p className="text-xs text-slate-400">Slope (Sensitivity)</p>
                              <p className="text-xl font-mono text-slate-200">{metrics.slope.toFixed(4)}</p>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded-lg">
                              <p className="text-xs text-slate-400">Intercept (Background)</p>
                              <p className="text-xl font-mono text-slate-200">{metrics.intercept.toFixed(4)}</p>
                          </div>
                      </div>
                      
                      <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-2">Equation</p>
                        <code className="text-sm text-emerald-300">
                           y = {metrics.slope.toFixed(3)}x + {metrics.intercept.toFixed(3)}
                        </code>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};