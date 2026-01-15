import express from 'express';
import cors from 'cors';
import { paraphrase } from './paraphraser.js';
import { translate } from './translator.js';
import { getSystemMetrics } from './state_manager.js';

const app = express();
const PORT = 3000;

// 1. MIDDLEWARE
// Allows JSON to be sent in the request body
app.use(express.json());
// Allows browsers (like your future React app) to talk to this server
app.use(cors());

// 2. LOGGING MIDDLEWARE (Optional but helpful)
app.use((req, res, next) => {
    console.log(`\n📨 [API REQUEST] ${req.method} ${req.url}`);
    next();
});

// --- ROUTES ---

/**
 * POST /api/paraphrase
 * Input: { "text": "...", "tone": "..." }
 */
app.post('/api/paraphrase', async (req, res) => {
    try {
        const { text, tone } = req.body;
        
        // Validation
        if (!text) {
            return res.status(400).json({ error: "Missing 'text' field" });
        }

        console.log(`   Processing Paraphrase: "${text.substring(0, 20)}..."`);
        
        // Call your existing logic
        const result = await paraphrase(text, tone);
        
        // Send success response
        res.json({ success: true, data: result });

    } catch (error) {
        console.error("   ❌ Server Error:", error.message);
        res.status(500).json({ success: false, error: "Internal AI Error" });
    }
});

/**
 * POST /api/translate
 * Input: { "text": "...", "source": "English", "target": "Hindi" }
 */
app.post('/api/translate', async (req, res) => {
    try {
        const { text, source, target } = req.body;

        if (!text || !target) {
            return res.status(400).json({ error: "Missing 'text' or 'target' field" });
        }

        console.log(`   Processing Translation to ${target}...`);
        
        const result = await translate(text, source, target);
        
        res.json({ success: true, data: result });

    } catch (error) {
        console.error("   ❌ Server Error:", error.message);
        res.status(500).json({ success: false, error: "Internal AI Error" });
    }
});

/**
 * GET /api/status
 * Returns the current token usage and provider health
 */
app.get('/api/status', (req, res) => {
    const metrics = getSystemMetrics();
    res.json(metrics);
});

// 3. START SERVER
app.listen(PORT, () => {
    console.log(`\n🚀 API Server running at http://localhost:${PORT}`);
    console.log(`   - POST /api/paraphrase`);
    console.log(`   - POST /api/translate`);
    console.log(`   - GET  /api/status`);
});