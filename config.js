import dotenv from "dotenv";
dotenv.config();

// SINGLE SOURCE OF TRUTH
export const CONFIG = {
    // 1. PRIMARY: Groq (Fast & Free)
    groq: {
        id: "groq",
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
        model: "llama-3.3-70b-versatile",
        priority: 1, // 1 = Highest
        limits: { 
            rpm: 30,      // Requests Per Minute
            rpd: 14400    // Requests Per Day
        }
    },

    // 2. BACKUP: Gemini (Reliable & Free)
    gemini: {
        id: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        // Gemini SDK doesn't use a standard baseURL like OpenAI, but we store config here
        model: "gemini-2.5-flash-lite",
        // model: "gemini-2.5-flash",
        // model: "gemma-3-4b",
        priority: 2,
        limits: { 
            rpm: 15, 
            rpd: 1500 
        }
    },

    // 3. FALLBACK: OpenAI (Paid)
    openai: {
        id: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: null, // Uses default SDK url
        model: "gpt-4o-mini",
        priority: 3, // Lowest priority (Last resort)
        limits: { 
            rpm: 5000, 
            rpd: Infinity 
        }
    }
};