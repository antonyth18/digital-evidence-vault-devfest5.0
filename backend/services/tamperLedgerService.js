const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../data/tamper_ledger.json');

// Ensure data directory exists
const dataDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initial load
let tamperEvents = [];
if (fs.existsSync(STORAGE_FILE)) {
    try {
        tamperEvents = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    } catch (e) {
        console.error('Failed to load tamper ledger storage:', e);
        tamperEvents = [];
    }
}

/**
 * Record a new tamper event
 * @param {Object} params - Event details
 * @param {string} params.evidenceId - ID of the evidence
 * @param {string} params.detectedBy - "AI" | "VERIFICATION"
 * @param {string} params.reason - Description of the tampering detection
 * @param {number} params.riskScore - Risk score (0-100)
 * @returns {Object|null} - The recorded event or null on failure
 */
function recordTamperEvent({ evidenceId, detectedBy, reason, riskScore }) {
    try {
        if (!evidenceId) return null;

        const event = {
            id: `TMR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            evidenceId,
            detectedBy: detectedBy || "UNKNOWN",
            reason: reason || "No reason provided",
            riskScore: riskScore || 0,
            timestamp: Date.now()
        };

        tamperEvents.push(event);

        // Persist to file
        try {
            fs.writeFileSync(STORAGE_FILE, JSON.stringify(tamperEvents, null, 2));
        } catch (e) {
            console.error('Failed to persist tamper event:', e);
        }

        console.log(`🚨 [Tamper Ledger] Append: Evidence #${evidenceId} | Source: ${detectedBy}`);
        return event;
    } catch (error) {
        console.error('⚠️ Tamper ledger failed to record event:', error.message);
        return null; // Fail silently
    }
}

/**
 * Get tamper events for a specific evidence ID
 * @param {string} evidenceId - Evidence ID to filter by
 * @returns {Array} - List of events for this evidence
 */
function getTamperEvents(evidenceId) {
    if (!evidenceId) return [];
    return tamperEvents.filter(event => event.evidenceId === evidenceId);
}

/**
 * Get all recorded tamper events
 * @returns {Array} - List of all events
 */
function getAllTamperEvents() {
    return [...tamperEvents];
}

module.exports = {
    recordTamperEvent,
    getTamperEvents,
    getAllTamperEvents
};
