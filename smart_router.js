import { CONFIG } from './config.js';
import { getSystemMetrics, recordUsage } from './state_manager.js';
import { callGroq } from './api_groq.js';
import { callGemini } from './api_gemini.js';
import { callOpenAI } from './api_openai.js';

// Map IDs to their actual functions for dynamic calling
const ADAPTERS = {
    groq: callGroq,
    gemini: callGemini,
    openai: callOpenAI
};

// In-memory store for Requests Per Minute (RPM)
// We keep this in memory because it resets every 60 seconds.
let rpmTracker = {
    startTime: Date.now(),
    counts: {}
};

/**
 * Resets the RPM counters if 60 seconds have passed.
 */
function checkRpmReset() {
    const now = Date.now();
    if (now - rpmTracker.startTime > 60000) {
        rpmTracker = {
            startTime: now,
            counts: {}
        };
    }
}

/**
 * Checks if a specific provider has exceeded its RPM limit.
 */
function isRpmLimitReached(providerId) {
    checkRpmReset();
    const limit = CONFIG[providerId].limits.rpm;
    const currentUsage = rpmTracker.counts[providerId] || 0;
    
    return currentUsage >= limit;
}

/**
 * Determines the order of providers to try.
 * * Logic:
 * 1. Filter out providers that hit their Daily Limit (RPD).
 * 2. Filter out providers that hit their Speed Limit (RPM).
 * 3. Sort the remaining valid providers by Priority (1 is highest).
 */
function getProviderChain() {
    const metrics = getSystemMetrics();
    const candidates = [];

    // Iterate over all keys in CONFIG (groq, gemini, openai)
    for (const providerId of Object.keys(CONFIG)) {
        const config = CONFIG[providerId];
        
        // 1. Check Daily Limit
        const dailyUsage = metrics.daily[providerId] || 0;
        if (dailyUsage >= config.limits.rpd) {
            console.warn(`[Router] Skipping ${providerId}: Daily limit reached.`);
            continue;
        }

        // 2. Check RPM Limit
        if (isRpmLimitReached(providerId)) {
            console.warn(`[Router] Skipping ${providerId}: RPM limit reached.`);
            continue;
        }

        candidates.push(config);
    }

    // 3. Sort by Priority
    // We subtract priorities. If (a - b) is negative, 'a' is placed first.
    // This sorts the array in ascending order: 1, 2, 3...
    return candidates.sort((a, b) => a.priority - b.priority);
}

/**
 * The Main Entry Point.
 * Routes the prompt to the best available provider with failover support.
 */
export async function routeRequest(prompt) {
    const providerChain = getProviderChain();

    if (providerChain.length === 0) {
        throw new Error("All providers are exhausted (Rate Limited or Daily Cap).");
    }

    // Iterate through the chain (Failover Logic)
    for (const provider of providerChain) {
        const providerId = provider.id;
        const adapterFunction = ADAPTERS[providerId];

        try {
            console.log(`[Router] Attempting: ${providerId.toUpperCase()}`);

            // Increment RPM count *before* calling (pessimistic locking)
            rpmTracker.counts[providerId] = (rpmTracker.counts[providerId] || 0) + 1;

            // Call the API
            console.log('calling the api from router.js')
            const result = await adapterFunction(prompt);

            // If successful, log persistence metrics
            recordUsage(providerId, result.usage);

            return result.text;

        } catch (error) {
            console.warn(`[Router] Failed with ${providerId}: ${error.message}`);
            // Loop continues to the next provider in the chain...
        }
    }

    // If the loop finishes without returning, everything failed
    throw new Error("System unavailable: All providers failed.");
}

const ans=await routeRequest('explain what is an api in 1 sentence')
console.log(ans)