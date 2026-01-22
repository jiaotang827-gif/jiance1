import React from 'react';

export const Methodology: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Methodology & Algorithm</h2>
            
            <div className="space-y-6 text-slate-300">
                <section>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">1. Dual-Mode Detection Principle</h3>
                    <p>
                        This system analyzes the colorimetric change of TMB catalyzed by nanomaterials. 
                        As pathogen concentration increases, the catalytic activity changes, altering the 
                        Blue-to-Green transition. We specifically target the <strong>Green/Red (G/R) Ratio</strong> 
                        as it normalizes for ambient light intensity and background noise better than raw intensity values.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">2. Computer Vision Pipeline</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Denoising:</strong> A Gaussian blur filter is applied to remove sensor grain from smartphone cameras.</li>
                        <li><strong>ROI Extraction:</strong> The algorithm automatically crops the central region of the image to avoid edge artifacts from the tube or well walls.</li>
                        <li><strong>Color Space Conversion:</strong> Pixels are analyzed in standard RGB space, and the average intensity of the G and R channels is computed to derive the signal metric.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">3. Machine Learning Model</h3>
                    <p>
                        The application uses a <strong>Linear Regression Algorithm</strong> (Least Squares Method) executed directly in the browser.
                        <br/>
                        <code className="bg-slate-800 px-2 py-1 rounded text-sm mt-2 block w-fit">Formula: Concentration = (Signal - Intercept) / Slope</code>
                    </p>
                    <p className="mt-2">
                        The model is validated using a random 70/30 split of the uploaded dataset. The <strong>Gemini 2.5 AI</strong> is employed as a 
                        post-processing supervisor to validate image quality (detecting shadows/blur) and to generate natural language reports interpreting the numerical data.
                    </p>
                </section>
            </div>
        </div>
    </div>
  );
};