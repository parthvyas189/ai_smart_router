import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "./config.js";

const ai = new GoogleGenAI({ apiKey: CONFIG.gemini.apiKey });

export async function callGemini(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: CONFIG.gemini.model,
            contents: prompt,
        });

        // Gemini returns usage in 'usageMetadata' with slightly different keys
        const rawUsage = response.usageMetadata || {};

        return {
            text: response.text,
            usage: {
                prompt: rawUsage.promptTokenCount || 0,
                completion: rawUsage.candidatesTokenCount || 0,
                total: rawUsage.totalTokenCount || 0
            }
        };

    } catch (error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
}