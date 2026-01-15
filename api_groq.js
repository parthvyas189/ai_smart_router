import OpenAI from "openai";
import { CONFIG } from "./config.js";

// Initialize once
const client = new OpenAI({
    apiKey: CONFIG.groq.apiKey,
    baseURL: CONFIG.groq.baseURL
});

export async function callGroq(prompt) {
    console.log('calling groq api from groq.js')
    try {
        const response = await client.chat.completions.create({
            model: CONFIG.groq.model,
            messages: [{ role: "user", content: prompt }]
        });

        // Normalize the usage data
        const rawUsage = response.usage || {};
        
        return {
            text: response.choices[0].message.content,
            usage: {
                prompt: rawUsage.prompt_tokens || 0,
                completion: rawUsage.completion_tokens || 0,
                total: rawUsage.total_tokens || 0
            }
        };

    } catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
}