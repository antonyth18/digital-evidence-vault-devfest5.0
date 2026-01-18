const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../data/evidence.json');

// Ensure data directory exists
const dataDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initial load
let evidence = [];
if (fs.existsSync(STORAGE_FILE)) {
    try {
        evidence = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    } catch (e) {
        console.error('Failed to load evidence storage:', e);
        evidence = [];
    }
}

/**
 * Save evidence metadata
 * @param {Object} metadata 
 */
function saveEvidence(metadata) {
    evidence.unshift(metadata); // Add to beginning for "recent" first
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(evidence, null, 2));
        return true;
    } catch (e) {
        console.error('Failed to save evidence:', e);
        return false;
    }
}

/**
 * Get all evidence
 * @returns {Array}
 */
function getAllEvidence() {
    return evidence;
}

/**
 * Get evidence by ID
 * @param {string} id 
 * @returns {Object|undefined}
 */
function getEvidenceById(id) {
    return evidence.find(e => e.evidenceId === id);
}

module.exports = {
    saveEvidence,
    getAllEvidence,
    getEvidenceById
};
