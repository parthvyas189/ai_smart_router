import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('metrics.json');

// Default schema ensures the file always has a valid structure
const DEFAULT_METRICS = {
    lastResetDate: new Date().toDateString(),
    daily: {},
    total: {}
};

/**
 * Ensures the metrics file exists with valid default data.
 */
function ensureFileExists() {
    if (!fs.existsSync(DATA_FILE)) {
        writeMetrics(DEFAULT_METRICS);
    }
}

/**
 * Reads the metrics file from disk.
 * Returns the default structure if read fails.
 */
function readMetrics() {
    try {
        ensureFileExists();
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Failed to read metrics file:', error.message);
        return DEFAULT_METRICS;
    }
}

/**
 * Writes the metrics object to disk.
 */
function writeMetrics(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to write metrics file:', error.message);
    }
}

/**
 * Checks if the day has changed since the last write.
 * If yes, resets the 'daily' counters in the metrics file.
 */
function rotateDailyMetrics(metrics) {
    const today = new Date().toDateString();
    
    if (metrics.lastResetDate !== today) {
        metrics.daily = {}; // Wipe daily counters
        metrics.lastResetDate = today;
        return true; // Indicates a reset occurred
    }
    return false;
}

/**
 * Retrieves the current metrics. 
 * Automatically handles daily rotation before returning.
 */
export function getSystemMetrics() {
    const metrics = readMetrics();
    
    if (rotateDailyMetrics(metrics)) {
        writeMetrics(metrics);
    }
    
    return metrics;
}

/**
 * Updates the usage stats for a specific provider.
 * Increments both daily request counts and total token usage.
 * * @param {string} providerId - The ID of the provider (e.g., 'groq', 'openai')
 * @param {object} usageData - The usage object returned by the adapter
 */
export function recordUsage(providerId, usageData) {
    const metrics = readMetrics();
    
    // Check rotation first to ensure we add to the correct day's bucket
    rotateDailyMetrics(metrics);

    // Initialize provider data if missing
    if (!metrics.daily[providerId]) metrics.daily[providerId] = 0;
    if (!metrics.total[providerId]) metrics.total[providerId] = 0;

    // Increment Request Count (Daily)
    metrics.daily[providerId] += 1;

    // Increment Token Count (Total)
    // We sum total tokens (prompt + completion)
    const newTokens = usageData.total || 0;
    metrics.total[providerId] += newTokens;

    writeMetrics(metrics);
}