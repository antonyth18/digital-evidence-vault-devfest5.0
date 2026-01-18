const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI (from compiled EvidenceRegistry.sol)
const EVIDENCE_REGISTRY_ABI = [
    "function registerEvidence(bytes32 evidenceHash, string calldata caseId) external returns (uint256 evidenceId)",
    "function logCustodyEvent(uint256 evidenceId, bytes32 action) external",
    "function logCustodyEventWithMetadata(uint256 evidenceId, bytes32 action, bytes32 metadataHash) external",
    "function verifyEvidence(uint256 evidenceId, bytes32 submittedHash) external returns (bool verified)",
    "function getEvidence(uint256 evidenceId) external view returns (tuple(bytes32 evidenceHash, string caseId, address collector, uint256 timestamp, uint8 status, uint256 custodyEventCount))",
    "function getCustodyEvent(uint256 evidenceId, uint256 eventIndex) external view returns (tuple(address handler, bytes32 action, uint256 timestamp, bytes32 metadataHash))",
    "function getCustodyEventCount(uint256 evidenceId) external view returns (uint256 count)",
    "function getEvidenceCount() external view returns (uint256)",
    "function getActionHash(string memory actionName) external pure returns (bytes32)",
    "event EvidenceRegistered(uint256 indexed evidenceId, bytes32 indexed evidenceHash, string caseId, address indexed collector, uint256 timestamp)",
    "event CustodyEventLogged(uint256 indexed evidenceId, address indexed handler, bytes32 action, uint256 eventIndex, uint256 timestamp)",
    "event VerificationPassed(uint256 indexed evidenceId, address indexed verifier, uint256 timestamp)",
    "event TamperDetected(uint256 indexed evidenceId, address indexed verifier, bytes32 expectedHash, bytes32 submittedHash, uint256 timestamp)"
];

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
            const contractAddress = process.env.CONTRACT_ADDRESS;
            const privateKey = process.env.PRIVATE_KEY;

            if (!contractAddress) {
                console.warn('⚠️  CONTRACT_ADDRESS not set - blockchain features disabled');
                return false;
            }

            // Connect to blockchain
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Create signer
            if (privateKey) {
                this.signer = new ethers.Wallet(privateKey, this.provider);
            } else {
                // Use first account from provider (for local development)
                const accounts = await this.provider.listAccounts();
                if (accounts.length > 0) {
                    this.signer = await this.provider.getSigner(0);
                } else {
                    throw new Error('No accounts available and no private key provided');
                }
            }

            // Connect to contract
            this.contract = new ethers.Contract(
                contractAddress,
                EVIDENCE_REGISTRY_ABI,
                this.signer
            );

            // Test connection
            const network = await this.provider.getNetwork();
            const signerAddress = await this.signer.getAddress();

            console.log('✅ Blockchain connected:');
            console.log('   Network:', network.name, `(chainId: ${network.chainId})`);
            console.log('   Contract:', contractAddress);
            console.log('   Signer:', signerAddress);

            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Blockchain initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Register evidence on blockchain
     */
    async registerEvidence(evidenceHash, caseId) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            // Convert hash to bytes32 if it's a hex string
            const hashBytes32 = evidenceHash.startsWith('0x') ? evidenceHash : `0x${evidenceHash}`;

            console.log('📝 Registering evidence on blockchain...');
            console.log('   Hash:', hashBytes32);
            console.log('   Case ID:', caseId);

            const tx = await this.contract.registerEvidence(hashBytes32, caseId);
            console.log('   Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('   Transaction confirmed in block:', receipt.blockNumber);

            // Extract evidence ID from event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed && parsed.name === 'EvidenceRegistered';
                } catch {
                    return false;
                }
            });

            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                const evidenceId = parsed.args[0];

                return {
                    evidenceId: evidenceId.toString(),
                    txHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                };
            }

            throw new Error('EvidenceRegistered event not found in receipt');
        } catch (error) {
            console.error('❌ Evidence registration failed:', error);
            throw error;
        }
    }

    /**
     * Log custody event on blockchain
     */
    async logCustodyEvent(evidenceId, action, metadataHash = null) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            // Get action hash
            const actionHash = await this.contract.getActionHash(action);

            console.log(`📋 Logging custody event: ${action}`);
            console.log('   Evidence ID:', evidenceId);
            console.log('   Action Hash:', actionHash);

            let tx;
            if (metadataHash) {
                const metadataBytes32 = metadataHash.startsWith('0x') ? metadataHash : `0x${metadataHash}`;
                tx = await this.contract.logCustodyEventWithMetadata(evidenceId, actionHash, metadataBytes32);
            } else {
                tx = await this.contract.logCustodyEvent(evidenceId, actionHash);
            }

            console.log('   Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('   Transaction confirmed in block:', receipt.blockNumber);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('❌ Custody event logging failed:', error);
            throw error;
        }
    }

    /**
     * Verify evidence integrity
     */
    async verifyEvidence(evidenceId, submittedHash) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            const hashBytes32 = submittedHash.startsWith('0x') ? submittedHash : `0x${submittedHash}`;

            console.log('🔍 Verifying evidence on blockchain...');
            console.log('   Evidence ID:', evidenceId);
            console.log('   Submitted Hash:', hashBytes32);

            const tx = await this.contract.verifyEvidence(evidenceId, hashBytes32);
            const receipt = await tx.wait();

            // Check for VerificationPassed or TamperDetected events
            const verificationEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed && (parsed.name === 'VerificationPassed' || parsed.name === 'TamperDetected');
                } catch {
                    return false;
                }
            });

            if (verificationEvent) {
                const parsed = this.contract.interface.parseLog(verificationEvent);

                if (parsed.name === 'VerificationPassed') {
                    return {
                        verified: true,
                        txHash: receipt.hash,
                        blockNumber: receipt.blockNumber,
                        timestamp: Date.now()
                    };
                } else if (parsed.name === 'TamperDetected') {
                    return {
                        verified: false,
                        txHash: receipt.hash,
                        blockNumber: receipt.blockNumber,
                        expectedHash: parsed.args.expectedHash,
                        submittedHash: parsed.args.submittedHash,
                        timestamp: Date.now()
                    };
                }
            }

            throw new Error('No verification event found');
        } catch (error) {
            console.error('❌ Evidence verification failed:', error);
            throw error;
        }
    }

    /**
     * Get evidence details from blockchain
     */
    async getEvidence(evidenceId) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            const evidence = await this.contract.getEvidence(evidenceId);

            return {
                evidenceHash: evidence[0],
                caseId: evidence[1],
                collector: evidence[2],
                timestamp: Number(evidence[3]),
                status: Number(evidence[4]),
                custodyEventCount: Number(evidence[5])
            };
        } catch (error) {
            console.error('❌ Failed to get evidence:', error);
            throw error;
        }
    }

    /**
     * Get all custody events for evidence
     */
    async getCustodyEvents(evidenceId) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            const evidence = await this.getEvidence(evidenceId);
            const eventCount = evidence.custodyEventCount;
            const events = [];

            for (let i = 0; i < eventCount; i++) {
                const event = await this.contract.getCustodyEvent(evidenceId, i);
                events.push({
                    handler: event[0],
                    action: event[1],
                    timestamp: Number(event[2]),
                    metadataHash: event[3],
                    eventIndex: i
                });
            }

            return events;
        } catch (error) {
            console.error('❌ Failed to get custody events:', error);
            throw error;
        }
    }

    /**
     * Get action name from hash
     */
    async getActionName(actionHash) {
        const actions = ['COLLECTED', 'ACCESSED', 'TRANSFERRED', 'VERIFIED', 'ANALYZED'];

        for (const action of actions) {
            const hash = await this.contract.getActionHash(action);
            if (hash === actionHash) {
                return action;
            }
        }
        return 'UNKNOWN';
    }

    /**
     * Emit a tamper detection event on blockchain
     * Step 3: Additive helper
     */
    async emitTamperDetected(evidenceId, detectedBy, reason, riskScore) {
        if (!this.initialized) return null;

        try {
            console.log(`🔗 [Blockchain] Emitting TamperDetected for #${evidenceId}`);

            // We use the existing TamperDetected signature from the contract
            // evidenceId (uint256), verifier (address), expectedHash (bytes32), submittedHash (bytes32), timestamp (uint256)
            // Note: This is an additive helper for future integration.
            return { status: "ready_to_emit", evidenceId, detectedBy };
        } catch (error) {
            console.error('⚠️ Blockchain emission failed:', error.message);
            return null;
        }
    }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
