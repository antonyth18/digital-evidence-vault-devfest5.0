const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const blockchainService = require('./services/blockchainService');
const { computeFileHash, computeStringHash, computeObjectHash } = require('./utils/crypto');
const policyEngine = require('./services/policyEngine');
const aiRiskScoring = require('./services/aiRiskScoring');
const tamperLedgerService = require('./services/tamperLedgerService'); // Step 1: Import Ledger Service
const evidenceStorage = require('./services/evidenceStorage');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (memory storage for hashing)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize blockchain and Supabase services
const supabaseService = require('./services/supabaseService');

let blockchainReady = false;
let supabaseReady = false;

Promise.all([
    blockchainService.initialize(),
    Promise.resolve(supabaseService.initializeSupabase())
]).then(([bcReady, sbReady]) => {
    blockchainReady = bcReady;
    supabaseReady = sbReady;

    if (blockchainReady) {
        console.log('✅ Blockchain service ready');
    } else {
        console.log('⚠️  Running in MOCK mode - blockchain disabled');
    }

    // Log final status after initialization
    printServerStatus();
});

function printServerStatus() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('   Digital Evidence Vault - Backend Server Status');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Blockchain Integration: ${blockchainReady ? '✅ ENABLED' : '⚠️  DISABLED'}`);
    console.log(`   Supabase Database:      ${supabaseReady ? '✅ ENABLED' : '⚠️  DISABLED'}`);
    console.log(`   Policy Engine:          ${process.env.ENABLE_POLICY_ENGINE === 'true' ? '✅ ENABLED' : '⚠️  DISABLED'}`);
    console.log(`   AI Risk Scoring:        ${process.env.ENABLE_AI_SCORING === 'true' ? '✅ ENABLED' : '⚠️  DISABLED'}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
}

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

        // 2. Upload to Supabase Storage
        let storageData = { path: null, url: null };
        if (supabaseReady) {
            storageData = await supabaseService.uploadFile(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            if (storageData.error) {
                console.error('⚠️ Storage upload failed:', storageData.error);
                return res.status(500).json({
                    error: 'Storage upload failed',
                    details: 'Ensure the "evidence-files" bucket exists in Supabase and has public/authenticated write policies.',
                    originalError: storageData.error
                });
            }
        }

        // 3. Register on blockchain
        if (blockchainReady) {
            const result = await blockchainService.registerEvidence(evidenceHash, caseId);

            // 4. Store metadata in Supabase Database
            const evidenceMetadata = {
                evidence_id: result.evidenceId,
                case_id: caseId,
                file_name: req.file.originalname,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                evidence_type: evidenceType || 'Unknown',
                source: source || 'Direct Upload',
                collected_by: collectedBy || 'System',
                sha256_hash: evidenceHash,
                storage_path: storageData.path,
                storage_url: storageData.url,
                tx_hash: result.txHash,
                block_number: result.blockNumber,
                block_number: result.blockNumber,
                gas_used: result.gasUsed ? result.gasUsed.toString() : '0',
                ai_analysis: null
            };

            // 5. Run AI Risk Scoring (Server-side verification)
            try {
                if (process.env.ENABLE_AI_SCORING !== 'false') {
                    const aiMetadata = {
                        fileName: req.file.originalname,
                        fileSize: req.file.size,
                        mimeType: req.file.mimetype,
                        uploadTime: Date.now()
                    };
                    const analysis = await aiRiskScoring.analyzeEvidence(req.file.buffer, aiMetadata);
                    evidenceMetadata.ai_analysis = {
                        riskScore: analysis.riskScore,
                        manipulationProbability: analysis.manipulationProbability,
                        signals: analysis.signals,
                        explanation: analysis.explanation,
                        details: analysis.details
                    };
                    console.log(`🤖 AI Verification: Score ${analysis.riskScore}/100`);
                }
            } catch (aiError) {
                console.error('⚠️ AI Analysis failed during upload:', aiError.message);
                // We don't fail the upload, just log it
            }

            console.log('✅ Evidence registered:', evidenceMetadata.evidence_id);

            // Persist evidence to DB
            if (supabaseReady) {
                await supabaseService.saveEvidenceMetadata(evidenceMetadata);
            } else {
                // Fallback to local memory storage for demo if DB not ready
                evidenceStorage.saveEvidence({
                    evidenceId: result.evidenceId,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    evidenceType: evidenceType,
                    source,
                    collectedBy,
                    caseId,
                    evidenceHash,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    timestamp: new Date().toISOString()
                });
            }

            // 5. Return blockchain proof to frontend (mapping fields to frontend expectations)
            return res.json({
                success: true,
                message: 'Evidence registered on blockchain',
                evidence: {
                    id: result.evidenceId,
                    type: evidenceType,
                    source: source,
                    collectedBy: collectedBy,
                    timestamp: new Date().toISOString(),
                    status: 'verified',
                    hash: evidenceHash,
                    size: req.file.size,
                    txHash: result.txHash,
                    storagePath: storageData.path
                },
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
// ITEM #7: REAL-TIME DATA ENDPOINTS
// ============================================

/**
 * Get all registered evidence
 * GET /api/evidence
 */
app.get('/api/evidence', async (req, res) => {
    try {
        if (supabaseReady) {
            // Extract query parameters for filtering
            const filters = {
                search: req.query.search,
                type: req.query.type,
                status: req.query.status
            };

            const evidence = await supabaseService.getEvidence(filters);

            // Map DB format to frontend format
            const mappedEvidence = evidence.map(e => ({
                evidenceId: e.evidence_id,
                evidenceType: e.evidence_type,
                source: e.source,
                collectedBy: e.collected_by || e.collectedBy, // fallback
                timestamp: e.created_at,
                evidenceHash: e.sha256_hash,
                fileSize: e.file_size,
                txHash: e.tx_hash,
                storagePath: e.storage_path,
                aiAnalysis: e.ai_analysis
            }));

            res.json({ success: true, evidence: mappedEvidence });
        } else {
            // Fallback to memory storage
            const evidence = evidenceStorage.getAllEvidence();
            console.warn('⚠️ Supabase not ready, returning in-memory evidence');
            res.json({ success: true, evidence });
        }
    } catch (error) {
        console.error('Get Evidence Failed:', error);
        res.status(500).json({ error: 'Failed to retrieve evidence' });
    }
});

/**
 * Get download URL for evidence
 * GET /api/evidence/:id/download
 */
app.get('/api/evidence/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        if (supabaseReady) {
            const evidence = await supabaseService.getEvidenceById(id);
            if (!evidence || !evidence.storage_path) {
                return res.status(404).json({ error: 'File not found' });
            }

            const url = await supabaseService.getFileUrl(evidence.storage_path);
            res.json({ success: true, url });
        } else {
            res.status(503).json({ error: 'Storage service unavailable' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download URL' });
    }
});

/**
 * Get analytics summary
 * GET /api/analytics/summary
 */
app.get('/api/analytics/summary', (req, res) => {
    try {
        const evidence = evidenceStorage.getAllEvidence();
        const total = evidence.length;

        const alerts = tamperLedgerService.getAllTamperEvents();
        const activeAlerts = alerts.filter(a => a.riskScore >= 70).length;
        const custodyBreaches = alerts.filter(a => a.detectedBy === 'VERIFICATION').length;

        res.json({
            totalEvidence: total,
            verifiedSafe: total - activeAlerts,
            activeAlerts: activeAlerts,
            custodyBreaches: custodyBreaches,
            recentActivity: evidence.slice(0, 5).map(e => ({
                id: e.evidenceId,
                action: 'Uploaded',
                actor: e.collectedBy,
                timestamp: e.timestamp
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve analytics summary' });
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

/**
 * Get all alerts
 * GET /api/alerts
 */
app.get('/api/alerts', (req, res) => {
    try {
        const alerts = tamperLedgerService.getAllTamperEvents();
        res.json({ success: true, alerts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve alerts' });
    }
});

/**
 * Get system audit log
 * GET /api/audit-log
 */
app.get('/api/audit-log', async (req, res) => {
    try {
        const evidence = evidenceStorage.getAllEvidence();
        const logs = [];

        // 1. Add registration events
        evidence.forEach(e => {
            logs.push({
                id: `REG-${e.evidenceId}`,
                timestamp: e.timestamp,
                actor: e.collectedBy,
                action: 'Evidence Registered',
                hash: e.evidenceHash,
                details: `File: ${e.fileName} (${e.evidenceType})`
            });
        });

        // 2. Add alerts from tamper ledger
        const alerts = tamperLedgerService.getAllTamperEvents();
        alerts.forEach(a => {
            logs.push({
                id: `ALR-${a.id}`,
                timestamp: new Date(a.timestamp).toISOString(),
                actor: a.detectedBy === 'AI' ? 'AI SENTRY' : 'BLOCKCHAIN VALIDATOR',
                action: 'Integrity Alert Raised',
                hash: 'SYSTEM_EVENT',
                details: a.reason
            });
        });

        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve audit log' });
    }
});

// ============================================
// EXISTING MOCK ENDPOINTS (for compatibility)
// ============================================

// Analytics endpoints
app.get('/api/analytics/status', (req, res) => {
    try {
        const evidence = evidenceStorage.getAllEvidence();
        const alerts = tamperLedgerService.getAllTamperEvents();
        const total = evidence.length;

        const activeAlerts = alerts.filter(a => a.riskScore >= 70).length;
        const custodyBreaches = alerts.filter(a => a.detectedBy === 'VERIFICATION').length;
        const verified = Math.max(0, total - activeAlerts - custodyBreaches);

        res.json([
            { name: 'Verified', value: verified, color: '#10b981' },
            { name: 'Flagged', value: activeAlerts, color: '#f59e0b' },
            { name: 'Breached', value: custodyBreaches, color: '#ef4444' }
        ]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve status analytics' });
    }
});

app.get('/api/analytics/trends', (req, res) => {
    try {
        const evidence = evidenceStorage.getAllEvidence();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Count uploads for this day
            const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

            const count = evidence.filter(e => {
                const ts = new Date(e.timestamp).getTime();
                return ts >= dayStart && ts <= dayEnd;
            }).length;

            data.push({
                date: dateStr,
                uploads: count
            });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve trend analytics' });
    }
});

app.get('/api/analytics/collectors', (req, res) => {
    try {
        const evidence = evidenceStorage.getAllEvidence();
        const collectorCounts = {};

        evidence.forEach(e => {
            const collector = e.collectedBy || 'Unknown';
            collectorCounts[collector] = (collectorCounts[collector] || 0) + 1;
        });

        const data = Object.entries(collectorCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve collector analytics' });
    }
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
    console.log(`🚀 Server starting on port ${PORT}...`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
