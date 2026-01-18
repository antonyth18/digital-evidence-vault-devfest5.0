const crypto = require('crypto');

/**
 * Compute SHA-256 hash of file buffer
 * @param {Buffer} fileBuffer - File content as buffer
 * @returns {string} - Hex hash with 0x prefix
 */
function computeFileHash(fileBuffer) {
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return '0x' + hash.digest('hex');
}

/**
 * Compute SHA-256 hash of string
 * @param {string} data - String to hash
 * @returns {string} - Hex hash with 0x prefix
 */
function computeStringHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return '0x' + hash.digest('hex');
}

/**
 * Compute hash of JSON object
 * @param {object} obj - Object to hash
 * @returns {string} - Hex hash with 0x prefix
 */
function computeObjectHash(obj) {
    const jsonString = JSON.stringify(obj);
    return computeStringHash(jsonString);
}

module.exports = {
    computeFileHash,
    computeStringHash,
    computeObjectHash
};
