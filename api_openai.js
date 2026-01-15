import OpenAI from "openai";
import { CONFIG } from "./config.js";

const client = new OpenAI({ apiKey: CONFIG.openai.apiKey });

export async function callOpenAI(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: CONFIG.openai.model,
            messages: [{ role: "user", content: prompt }]
        });

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
        throw new Error(`OpenAI API Error: ${error.message}`);
    }
}