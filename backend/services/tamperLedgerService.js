/**
 * Tamper Ledger Service
 * 
 * Append-only in-memory storage for tamper events.
 * Fail-safe implementation: all functions are designed to never throw.
 */

const tamperEvents = [];

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
        console.log(`🚨 [Tamper Ledger] Append: Evidence #${evidenceId} | Source: ${detectedBy}`);
        return event;
    } catch (error) {
        console.error('⚠️ Tamper ledger failed to record event:', error.message);
        return null; // Fail silently
    }
}

/**
 * Get tamper events for a specific evidence ID
 * @param {string} evidenceId - ID of the evidence
 * @returns {Array} - List of events (always returns an array)
 */
function getTamperEventsByEvidenceId(evidenceId) {
    try {
        if (!evidenceId) return [];
        return tamperEvents.filter(e => e.evidenceId === evidenceId);
    } catch (error) {
        console.error('⚠️ Tamper ledger failed to retrieve events:', error.message);
        return [];
    }
}

module.exports = {
    recordTamperEvent,
    getTamperEventsByEvidenceId
};
