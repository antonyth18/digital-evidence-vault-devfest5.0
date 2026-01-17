const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const blockchainService = require('./services/blockchainService');
const { computeFileHash, computeStringHash, computeObjectHash } = require('./utils/crypto');
const policyEngine = require('./services/policyEngine');
const aiRiskScoring = require('./services/aiRiskScoring');
const tamperLedgerService = require('./services/tamperLedgerService'); // Step 1: Import Ledger Service

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (memory storage for hashing)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize blockchain service
let blockchainReady = false;
blockchainService.initialize().then(ready => {
    blockchainReady = ready;
    if (ready) {
        console.log('✅ Blockchain service ready');
    } else {
        console.log('⚠️  Running in MOCK mode - blockchain disabled');
    }
});

// ============================================
// ITEM #1: END-TO-END EVIDENCE REGISTRATION
// ============================================

/**
 * Upload and register evidence on blockchain
 * POST /api/evidence/upload-blockchain
 */
app.post('/api/evidence/upload-blockchain', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { caseId, evidenceType, source, collectedBy } = req.body;

        if (!caseId) {
            return res.status(400).json({ error: 'Case ID is required' });
        }

        // 1. Compute SHA-256 hash of file
        const evidenceHash = computeFileHash(req.file.buffer);
        console.log('📁 File uploaded:', req.file.originalname);
        console.log('🔐 SHA-256 Hash:', evidenceHash);

        // 2. Register on blockchain
        if (blockchainReady) {
            const result = await blockchainService.registerEvidence(evidenceHash, caseId);

            // 3. Store metadata in database (mock for now)
            const evidenceMetadata = {
                evidenceId: result.evidenceId,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                evidenceType: evidenceType || 'Unknown',
                source: source || 'Direct Upload',
                collectedBy: collectedBy || 'System',
                caseId,
                evidenceHash,
                txHash: result.txHash,
                blockNumber: result.blockNumber,
                timestamp: new Date().toISOString()
            };

            console.log('✅ Evidence registered:', evidenceMetadata.evidenceId);

            // 4. Return blockchain proof to frontend
            return res.json({
                success: true,
                message: 'Evidence registered on blockchain',
                evidence: evidenceMetadata,
                blockchain: {
                    evidenceId: result.evidenceId,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`,
                    gasUsed: result.gasUsed
                }
            });
        } else {
            // Mock mode fallback
            return res.json({
                success: false,
                error: 'Blockchain not available - upload would succeed with blockchain',
                mockData: {
                    evidenceHash,
                    caseId,
                    fileName: req.file.originalname
                }
            });
        }
    } catch (error) {
        console.error('❌ Evidence upload failed:', error);
        res.status(500).json({
            error: 'Evidence upload failed',
            message: error.message
        });
    }
});

// ============================================
// ITEM #2: ON-CHAIN CUSTODY LOGGING
// ============================================

/**
 * Log custody event on blockchain
 * POST /api/custody/:evidenceId/log
 */
app.post('/api/custody/:evidenceId/log', async (req, res) => {
    try {
        const { evidenceId } = req.params;
        const { action, handler, details } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Action is required' });
        }

        console.log(`📋 Logging custody event for Evidence #${evidenceId}`);
        console.log(`   Action: ${action}`);
        console.log(`   Handler: ${handler || 'Current user'}`);

        if (blockchainReady) {
            // ITEM #3: Policy validation (if enabled)
            if (process.env.ENABLE_POLICY_ENGINE === 'true') {
                const validationResult = await policyEngine.validateCustodyAction(
                    evidenceId,
                    action,
                    handler,
                    details
                );

                if (!validationResult.valid) {
                    console.log('⚠️  Policy violation detected:', validationResult.violation);

                    // Log violation on blockchain
                    const violationData = {
                        type: validationResult.violation,
                        details: validationResult.details,
                        timestamp: Date.now()
                    };
                    const violationHash = computeObjectHash(violationData);

                    const result = await blockchainService.logCustodyEvent(
                        evidenceId,
                        'VIOLATION',
                        violationHash
                    );

                    return res.status(403).json({
                        success: false,
                        blocked: true,
                        reason: validationResult.violation,
                        details: validationResult.details,
                        blockchain: {
                            txHash: result.txHash,
                            blockNumber: result.blockNumber,
                            explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`
                        }
                    });
                }
            }

            // Compute metadata hash if details provided
            let metadataHash = null;
            if (details) {
                metadataHash = computeObjectHash(details);
            }

            // Log custody event on blockchain
            const result = await blockchainService.logCustodyEvent(
                evidenceId,
                action,
                metadataHash
            );

            return res.json({
                success: true,
                message: 'Custody event logged on blockchain',
                blockchain: {
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`,
                    gasUsed: result.gasUsed
                }
            });
        } else {
            return res.json({
                success: false,
                error: 'Blockchain not available'
            });
        }
    } catch (error) {
        console.error('❌ Custody logging failed:', error);
        res.status(500).json({
            error: 'Custody logging failed',
            message: error.message
        });
    }
});

/**
 * Get custody events from blockchain
 * GET /api/custody/:evidenceId
 */
app.get('/api/custody/:evidenceId', async (req, res) => {
    try {
        const { evidenceId } = req.params;

        if (blockchainReady) {
            // Read custody events from blockchain
            const events = await blockchainService.getCustodyEvents(evidenceId);

            // Enrich with action names
            const enrichedEvents = await Promise.all(
                events.map(async (event) => {
                    const actionName = await blockchainService.getActionName(event.action);
                    return {
                        eventIndex: event.eventIndex,
                        action: actionName,
                        handler: event.handler,
                        timestamp: new Date(event.timestamp * 1000).toISOString(),
                        metadataHash: event.metadataHash,
                        blockchainVerified: true
                    };
                })
            );

            return res.json({
                evidenceId,
                events: enrichedEvents,
                totalEvents: enrichedEvents.length,
                source: 'blockchain'
            });
        } else {
            return res.json({
                evidenceId,
                events: [],
                error: 'Blockchain not available'
            });
        }
    } catch (error) {
        console.error('❌ Failed to get custody events:', error);
        res.status(500).json({
            error: 'Failed to get custody events',
            message: error.message
        });
    }
});

// ============================================
// ITEM #4: TAMPER PROOF EVENT WIRING
// ============================================

/**
 * Verify evidence integrity on blockchain
 * POST /api/verify-blockchain
 */
app.post('/api/verify-blockchain', upload.single('file'), async (req, res) => {
    try {
        const { evidenceId } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded for verification' });
        }

        if (!evidenceId) {
            return res.status(400).json({ error: 'Evidence ID is required' });
        }

        // Compute hash of submitted file
        const submittedHash = computeFileHash(req.file.buffer);
        console.log('🔍 Verifying Evidence #' + evidenceId);
        console.log('   Submitted Hash:', submittedHash);

        if (blockchainReady) {
            // Verify on blockchain
            const result = await blockchainService.verifyEvidence(evidenceId, submittedHash);

            if (result.verified) {
                console.log('✅ Verification PASSED');
                return res.json({
                    verified: true,
                    message: 'Evidence integrity verified on blockchain',
                    evidenceId,
                    submittedHash,
                    blockchain: {
                        txHash: result.txHash,
                        blockNumber: result.blockNumber,
                        explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`,
                        event: 'VerificationPassed'
                    }
                });
            } else {
                console.log('❌ TAMPER DETECTED');

                // Step 2: Hook for Tamper Ledger (Verification mismatch)
                try {
                    tamperLedgerService.recordTamperEvent({
                        evidenceId: evidenceId,
                        detectedBy: "VERIFICATION",
                        reason: `Hash mismatch. Expected: ${result.expectedHash}, Submitted: ${result.submittedHash}`,
                        riskScore: 100
                    });
                } catch (_) { }

                return res.json({
                    verified: false,
                    tampered: true,
                    message: 'TAMPER DETECTED - Hash mismatch',
                    evidenceId,
                    expectedHash: result.expectedHash,
                    submittedHash: result.submittedHash,
                    blockchain: {
                        txHash: result.txHash,
                        blockNumber: result.blockNumber,
                        explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`,
                        event: 'TamperDetected'
                    }
                });
            }
        } else {
            return res.json({
                verified: false,
                error: 'Blockchain not available'
            });
        }
    } catch (error) {
        console.error('❌ Verification failed:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: error.message
        });
    }
});

// ============================================
// ITEM #6: AI RISK SCORING
// ============================================

/**
 * AI Risk Scoring for uploaded evidence
 * POST /api/ai/risk-score
 */
app.post('/api/ai/risk-score', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided for analysis' });
        }

        const metadata = {
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadTime: Date.now()
        };

        console.log('🤖 Running AI risk analysis...');

        // Run AI risk scoring
        const analysis = await aiRiskScoring.analyzeEvidence(req.file.buffer, metadata);

        console.log(`   Risk Score: ${analysis.riskScore}/100`);
        console.log(`   Recommendation: ${analysis.recommendation}`);

        return res.json({
            success: true,
            analysis: {
                riskScore: analysis.riskScore,
                confidence: analysis.confidence,
                recommendation: analysis.recommendation,
                signals: analysis.signals,
                explanation: analysis.explanation,
                details: analysis.details
            }
        });
    } catch (error) {
        console.error('❌ AI risk scoring failed:', error);
        res.status(500).json({
            error: 'AI risk scoring failed',
            message: error.message
        });
    }
});

// ============================================
// STEP 4: TAMPER EVENT RETRIEVAL (Read-Only)
// ============================================

/**
 * Get tamper events for a specific evidence
 * GET /api/tamper-events/:evidenceId
 */
app.get('/api/tamper-events/:evidenceId', (req, res) => {
    try {
        const { evidenceId } = req.params;
        const events = tamperLedgerService.getTamperEventsByEvidenceId(evidenceId);
        res.json({ success: true, evidenceId, events });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tamper events' });
    }
});

// ============================================
// EXISTING MOCK ENDPOINTS (for compatibility)
// ============================================

// Analytics endpoints
app.get('/api/analytics/status', (req, res) => {
    res.json([
        { name: 'Verified', value: 1281, color: '#10b981' },
        { name: 'Flagged', value: 2, color: '#f59e0b' },
        { name: 'Breached', value: 1, color: '#ef4444' }
    ]);
});

app.get('/api/analytics/trends', (req, res) => {
    const data = [];
    for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            uploads: Math.floor(Math.random() * 10) + 3
        });
    }
    res.json(data);
});

app.get('/api/analytics/collectors', (req, res) => {
    res.json([
        { name: 'Officer Ryan', count: 28 },
        { name: 'Det. Lin', count: 24 },
        { name: 'Off. Martinez', count: 19 },
        { name: 'Det. Chen', count: 17 },
        { name: 'Off. Patel', count: 14 }
    ]);
});

// Health check
app.get('/api/health', async (req, res) => {
    res.json({
        status: 'ok',
        blockchain: blockchainReady ? 'connected' : 'disconnected',
        policyEngine: process.env.ENABLE_POLICY_ENGINE === 'true' ? 'enabled' : 'disabled',
        aiScoring: process.env.ENABLE_AI_SCORING === 'true' ? 'enabled' : 'disabled',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('   Digital Evidence Vault - Backend Server');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('   Blockchain Integration: ' + (blockchainReady ? '✅ ENABLED' : '⚠️  DISABLED'));
    console.log('   Policy Engine: ' + (process.env.ENABLE_POLICY_ENGINE === 'true' ? '✅ ENABLED' : '⚠️  DISABLED'));
    console.log('   AI Risk Scoring: ' + (process.env.ENABLE_AI_SCORING === 'true' ? '✅ ENABLED' : '⚠️  DISABLED'));
    console.log('═══════════════════════════════════════════════════');
    console.log('');
});

module.exports = app;
