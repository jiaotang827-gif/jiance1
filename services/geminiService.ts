import { GoogleGenAI } from "@google/genai";
import { DetectionData, ModelMetrics } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
};

export const analyzeImageQuality = async (base64Image: string) => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Check this image for a scientific colorimetric test. Is the lighting even? Is the image blurry? Answer in JSON format: { \"quality\": \"good\" | \"poor\", \"issue\": \"...\" }" }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });
        const text = response.text;
        return JSON.parse(text || '{}');
    } catch (e) {
        console.error("Gemini quality check failed", e);
        return { quality: "unknown", issue: "AI check failed" };
    }
};

export const generateScientificReport = async (
    sample: DetectionData,
    modelMetrics: ModelMetrics
) => {
    try {
        const ai = getClient();
        const prompt = `
            You are a Food Safety Expert and AI Researcher.
            A dual-mode fluorescence/colorimetric detection test for foodborne pathogens (using nanomaterial TMB catalysis) has been analyzed.
            
            Context:
            - The detection uses RGB analysis converted to G/R Ratio.
            - A linear regression model was trained with R² = ${modelMetrics.rSquared.toFixed(3)}.
            - Sample Data: G/R Ratio = ${sample.grRatio.toFixed(3)}.
            - Predicted Pathogen Concentration = ${sample.predictedConcentration?.toFixed(2)} CFU/mL (log scale or arbitrary unit).

            Please generate a short, professional interpretation of this result. 
            1. Comment on the reliability based on the R² score.
            2. Explain the significance of the G/R ratio in this context (Green fluorescence vs Red background/reference).
            3. Provide a concluding statement on whether the sample is likely contaminated (assuming > 0 is detected).
            
            Keep it under 150 words.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return response.text;
    } catch (e) {
        console.error("Report generation failed", e);
        return "Could not generate AI report.";
    }
};