/**
 * AI Risk Scoring Service
 * ITEM #6: Deterministic heuristics for hackathon demo
 */

const crypto = require('crypto');

class AIRiskScoring {
    /**
     * Analyze evidence for tampering risk
     * Uses deterministic heuristics for demo
     */
    async analyzeEvidence(fileBuffer, metadata) {
        const signals = [];
        let riskScore = 0;

        // 1. File size anomaly detection
        const sizeMB = metadata.fileSize / (1024 * 1024);
        if (sizeMB > 500) {
            signals.push({
                type: 'LARGE_FILE_SIZE',
                severity: 'LOW',
                detail: `File size ${sizeMB.toFixed(1)}MB exceeds typical evidence size`
            });
            riskScore += 10;
        }

        // 2. Metadata analysis
        if (this._hasMetadataAnomalies(metadata)) {
            signals.push({
                type: 'METADATA_ANOMALY',
                severity: 'MEDIUM',
                detail: 'File metadata shows inconsistencies'
            });
            riskScore += 25;
        }

        // 3. Re-encoding detection (simple heuristic)
        if (this._detectReencoding(metadata)) {
            signals.push({
                type: 'UNEXPECTED_RE_ENCODING',
                severity: 'HIGH',
                detail: 'File shows signs of re-encoding after initial creation'
            });
            riskScore += 30;
        }

        // 4. File signature analysis
        const signatureRisk = this._analyzeFileSignature(fileBuffer);
        if (signatureRisk.risk) {
            signals.push(signatureRisk.signal);
            riskScore += signatureRisk.points;
        }

        // 5. Entropy analysis (detect encryption/compression patterns)
        const entropyRisk = this._analyzeEntropy(fileBuffer);
        if (entropyRisk.risk) {
            signals.push(entropyRisk.signal);
            riskScore += entropyRisk.points;
        }

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        // Generate recommendation
        const recommendation = this._generateRecommendation(riskScore);

        // Generate explanation
        const explanation = this._generateExplanation(signals, riskScore);

        // Step 2: Tamper Ledger Hook (Additive & Fail-safe)
        try {
            if (riskScore > 70) {
                const { recordTamperEvent } = require('./tamperLedgerService');
                recordTamperEvent({
                    evidenceId: metadata.evidenceId || "UNKNOWN",
                    detectedBy: "AI",
                    reason: explanation,
                    riskScore: riskScore
                });
            }
        } catch (_) { }

        return {
            riskScore,
            confidence: signals.length > 0 ? 0.85 : 0.95,
            recommendation,
            signals: signals.map(s => s.type),
            explanation,
            details: {
                signals,
                fileSize: metadata.fileSize,
                fileName: metadata.fileName,
                analyzed: new Date().toISOString()
            }
        };
    }

    /**
     * Detect metadata anomalies
     */
    _hasMetadataAnomalies(metadata) {
        // Check filename patterns that suggest manipulation
        const suspiciousPatterns = [
            /copy/i,
            /edited/i,
            /modified/i,
            /fake/i,
            /tampered/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(metadata.fileName));
    }

    /**
     * Detect re-encoding
     */
    _detectReencoding(metadata) {
        // Simple heuristic: Check for video/audio re-encoding indicators
        const reencodeIndicators = [
            'handbrake',
            'ffmpeg',
            'converted',
            'compressed'
        ];

        return reencodeIndicators.some(indicator =>
            metadata.fileName.toLowerCase().includes(indicator)
        );
    }

    /**
     * Analyze file signature (magic bytes)
     */
    _analyzeFileSignature(fileBuffer) {
        // Get first 16 bytes
        const header = fileBuffer.slice(0, 16);
        const headerHex = header.toString('hex');

        // Check for common file signatures
        const signatures = {
            'ffd8ff': 'JPEG',
            '89504e47': 'PNG',
            '474946': 'GIF',
            '25504446': 'PDF',
            '504b0304': 'ZIP/DOCX',
            '1f8b': 'GZIP'
        };

        // Check if file signature matches declared type
        // For demo, we'll flag files with suspicious signatures
        if (headerHex.startsWith('504b')) {
            return {
                risk: true,
                points: 15,
                signal: {
                    type: 'SUSPICIOUS_FILE_SIGNATURE',
                    severity: 'MEDIUM',
                    detail: 'File signature indicates archive format (potential obfuscation)'
                }
            };
        }

        return { risk: false };
    }

    /**
     * Analyze file entropy
     */
    _analyzeEntropy(fileBuffer) {
        // Sample first 1KB for entropy calculation
        const sample = fileBuffer.slice(0, Math.min(1024, fileBuffer.length));

        // Calculate byte frequency
        const freq = new Array(256).fill(0);
        for (let i = 0; i < sample.length; i++) {
            freq[sample[i]]++;
        }

        // Calculate Shannon entropy
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (freq[i] > 0) {
                const p = freq[i] / sample.length;
                entropy -= p * Math.log2(p);
            }
        }

        // High entropy suggests encryption or compression
        if (entropy > 7.5) {
            return {
                risk: true,
                points: 20,
                signal: {
                    type: 'HIGH_ENTROPY_DETECTED',
                    severity: 'MEDIUM',
                    detail: `File entropy ${entropy.toFixed(2)} suggests encryption or heavy compression`
                }
            };
        }

        return { risk: false };
    }

    /**
     * Generate recommendation based on risk score
     */
    _generateRecommendation(riskScore) {
        if (riskScore < 30) {
            return 'AUTO_APPROVE';
        } else if (riskScore < 70) {
            return 'REVIEW_RECOMMENDED';
        } else {
            return 'FORENSIC_REVIEW_REQUIRED';
        }
    }

    /**
     * Generate human-readable explanation
     */
    _generateExplanation(signals, riskScore) {
        if (signals.length === 0) {
            return 'No anomalies detected. File appears to be authentic and unmodified.';
        }

        const highSeverity = signals.filter(s => s.severity === 'HIGH');
        const mediumSeverity = signals.filter(s => s.severity === 'MEDIUM');

        if (highSeverity.length > 0) {
            return `High-risk indicators detected: ${highSeverity.map(s => s.detail).join('; ')}. Forensic review strongly recommended.`;
        }

        if (mediumSeverity.length > 0) {
            return `Medium-risk indicators detected: ${mediumSeverity.map(s => s.detail).join('; ')}. Manual review recommended before acceptance.`;
        }

        return `Low-risk indicators detected. File may proceed with standard verification.`;
    }
}

module.exports = new AIRiskScoring();
