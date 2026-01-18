# Digital Evidence Vault - Court-Grade Architecture (Continued)

# PART 2 — BLOCKCHAIN-FIRST FEATURES

## 3️⃣ Custody Hash Chain Visualization

### Overview

The **Custody Hash Chain** provides a visual, undeniable representation of evidence integrity by showing cryptographic links between custody events. Any tampering breaks the chain visually and cryptographically.

---

### Conceptual Design

```
EVIDENCE REGISTRATION (Block 8472901)
┌────────────────────────────────────┐
│ Evidence ID: EV-2024-001          │
│ Original Hash: 0x8f434346...      │
│ Timestamp: 2024-01-14 16:20 UTC   │
└─────────────┬──────────────────────┘
              │
              │ H₀ = SHA256(evidence_file)
              ▼
┌────────────────────────────────────┐
│ COLLECTED (Block 8472901)         │
│ H₁ = SHA256(H₀ + event_data)      │
│ Chain Hash: 0x7a4c2b9d...         │
└─────────────┬──────────────────────┘
              │
              │ Cryptographically Linked
              ▼
┌────────────────────────────────────┐
│ SEALED (Block 8472910)            │
│ H₂ = SHA256(H₁ + event_data)      │
│ Chain Hash: 0x5e9f3d2c...         │
└─────────────┬──────────────────────┘
              │
              │ Cryptographically Linked
              ▼
┌────────────────────────────────────┐
│ ANALYZED (Block 8472945)          │
│ H₃ = SHA256(H₂ + event_data)      │
│ Chain Hash: 0x2b1a7c9d...         │
└─────────────┬──────────────────────┘
              │
              │ Cryptographically Linked
              ▼
┌────────────────────────────────────┐
│ VERIFIED (Block 8473012)          │
│ H₄ = SHA256(H₃ + evidence_hash)   │
│ ✅ Chain Integrity: INTACT         │
└────────────────────────────────────┘
```

---

### With Tampering Detected

```
EVIDENCE REGISTRATION
┌────────────────────────────────────┐
│ Evidence ID: EV-2024-002          │
│ Original Hash: 0x3c4d5e6f...      │
└─────────────┬──────────────────────┘
              ▼
┌────────────────────────────────────┐
│ COLLECTED                          │
│ Chain Hash: 0x9a8b7c6d...         │
└─────────────┬──────────────────────┘
              ▼
┌────────────────────────────────────┐
│ ANALYZED                           │
│ Chain Hash: 0x1a2b3c4d...         │
└─────────────┬──────────────────────┘
              │
              │ ⚠️ FILE MODIFIED ⚠️
              ▼
┌────────────────────────────────────┐
│ VERIFIED (FAILED)                  │
│ Expected: 0x3c4d5e6f...           │
│ Got:      0xFFFFFFFF...           │
│ ❌ HASH MISMATCH - CHAIN BROKEN   │
│ 🚨 TamperDetected Event Emitted    │
└────────────────────────────────────┘
```

---

### Implementation: Smart Contract Extension

```solidity
/**
 * @title Custody Hash Chain
 * @notice Implements cryptographic chaining of custody events
 */
contract EvidenceRegistry {
    
    struct Evidence {
        bytes32 evidenceHash;
        bytes32 currentChainHead; // Most recent hash in chain
        // ... other fields
    }
    
    /**
     * @notice Compute next chain hash
     * @dev H(n+1) = SHA256(H(n) + action + handler + timestamp)
     */
    function _computeChainHash(
        bytes32 previousHash,
        bytes32 action,
        address handler,
        uint256 timestamp
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            previousHash,
            action,
            handler,
            timestamp
        ));
    }
    
    /**
     * @notice Log custody event with hash chaining
     */
    function logCustodyEvent(
        uint256 evidenceId,
        bytes32 action
    ) external evidenceExists(evidenceId) {
        Evidence storage evidence = _evidence[evidenceId];
        
        // Get previous chain head
        bytes32 previousHash = evidence.currentChainHead;
        if (previousHash == bytes32(0)) {
            // First custody event - use evidence hash
            previousHash = evidence.evidenceHash;
        }
        
        // Compute new chain hash
        bytes32 newChainHash = _computeChainHash(
            previousHash,
            action,
            msg.sender,
            block.timestamp
        );
        
        // Update chain head
        evidence.currentChainHead = newChainHash;
        
        // Store event with chain hash
        uint256 eventIndex = evidence.custodyEventCount;
        _custodyLog[evidenceId][eventIndex] = CustodyEvent({
            handler: msg.sender,
            action: action,
            timestamp: block.timestamp,
            chainHash: newChainHash  // NEW FIELD
        });
        
        emit CustodyEventLogged(
            evidenceId,
            msg.sender,
            action,
            eventIndex,
            block.timestamp,
            newChainHash  // Include in event
        );
        
        evidence.custodyEventCount++;
    }
    
    /**
     * @notice Verify chain integrity
     * @dev Recomputes entire hash chain and compares with stored values
     */
    function verifyChainIntegrity(uint256 evidenceId)
        external
        view
        evidenceExists(evidenceId)
        returns (bool intact, uint256 brokenAtIndex)
    {
        Evidence storage evidence = _evidence[evidenceId];
        uint256 eventCount = evidence.custodyEventCount;
        
        bytes32 expectedHash = evidence.evidenceHash;
        
        for (uint256 i = 0; i < eventCount; i++) {
            CustodyEvent storage event = _custodyLog[evidenceId][i];
            
            // Compute expected hash for this event
            expectedHash = _computeChainHash(
                expectedHash,
                event.action,
                event.handler,
                event.timestamp
            );
            
            // Compare with stored hash
            if (expectedHash != event.chainHash) {
                return (false, i); // Chain broken at index i
            }
        }
        
        return (true, 0); // Chain intact
    }
}
```

---

### Frontend Visualization Component

```tsx
interface ChainNode {
  eventIndex: number;
  action: string;
  handler: string;
  timestamp: string;
  chainHash: string;
  previousHash: string;
  intact: boolean;
}

export function CustodyHashChainVisualizer({ evidenceId }: { evidenceId: string }) {
  const [chain, setChain] = useState<ChainNode[]>([]);
  const [chainIntact, setChainIntact] = useState<boolean>(true);
  const [brokenAt, setBrokenAt] = useState<number | null>(null);

  useEffect(() => {
    loadChain();
  }, [evidenceId]);

  async function loadChain() {
    // 1. Get evidence and custody events from blockchain
    const evidence = await contract.getEvidence(evidenceId);
    const eventCount = await contract.getCustodyEventCount(evidenceId);
    
    const nodes: ChainNode[] = [];
    let previousHash = evidence.evidenceHash;
    
    for (let i = 0; i < eventCount; i++) {
      const event = await contract.getCustodyEvent(evidenceId, i);
      
      // Recompute expected hash
      const expectedHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'bytes32', 'address', 'uint256'],
          [previousHash, event.action, event.handler, event.timestamp]
        )
      );
      
      nodes.push({
        eventIndex: i,
        action: event.action,
        handler: event.handler,
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        chainHash: event.chainHash,
        previousHash: previousHash,
        intact: expectedHash === event.chainHash
      });
      
      previousHash = event.chainHash;
    }
    
    setChain(nodes);
    
    // Check overall integrity
    const broken = nodes.findIndex(n => !n.intact);
    if (broken !== -1) {
      setChainIntact(false);
      setBrokenAt(broken);
    }
  }

  return (
    <div className="custody-chain-visualizer">
      <div className="chain-header">
        <h2>Custody Hash Chain</h2>
        {chainIntact ? (
          <Badge variant="success">✓ Chain Intact</Badge>
        ) : (
          <Badge variant="danger">⚠ Chain Broken at Event {brokenAt}</Badge>
        )}
      </div>
      
      <div className="chain-timeline">
        {/* Evidence Registration Node */}
        <div className="chain-node registration">
          <div className="node-icon">📁</div>
          <div className="node-content">
            <h4>Evidence Registered</h4>
            <code className="hash">{evidence.evidenceHash.slice(0, 16)}...</code>
          </div>
        </div>
        
        <div className="chain-connector intact" />
        
        {/* Custody Event Nodes */}
        {chain.map((node, index) => (
          <React.Fragment key={index}>
            <div className={`chain-node ${node.intact ? 'intact' : 'broken'}`}>
              <div className="node-icon">
                {node.intact ? '✓' : '✗'}
              </div>
              <div className="node-content">
                <h4>{node.action}</h4>
                <p className="handler">{node.handler.slice(0, 10)}...</p>
                <p className="timestamp">{node.timestamp}</p>
                
                {/* Hash Computation Display */}
                <details className="hash-computation">
                  <summary>View Hash Computation</summary>
                  <div className="computation">
                    <div>Previous: <code>{node.previousHash.slice(0, 16)}...</code></div>
                    <div>+ Action: <code>{node.action}</code></div>
                    <div>+ Handler: <code>{node.handler.slice(0, 10)}...</code></div>
                    <div>+ Time: <code>{node.timestamp}</code></div>
                    <div className="divider">↓ SHA-256</div>
                    <div>Result: <code className={node.intact ? 'intact' : 'broken'}>
                      {node.chainHash.slice(0, 16)}...
                    </code></div>
                  </div>
                </details>
                
                {!node.intact && (
                  <div className="tamper-alert">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hash Mismatch Detected</span>
                  </div>
                )}
              </div>
            </div>
            
            {index < chain.length - 1 && (
              <div className={`chain-connector ${chain[index + 1].intact ? 'intact' : 'broken'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Blockchain Verification */}
      <div className="blockchain-proof">
        <h3>Blockchain Verification</h3>
        <p>All custody events are verifiable on blockchain:</p>
        <Button onClick={() => window.open(`https://etherscan.io/address/${contractAddress}`, '_blank')}>
          View on Etherscan
        </Button>
      </div>
    </div>
  );
}
```

---

### Why This is Powerful

#### **Visual Undeniability**

Traditional Database:
```
"The custody log shows evidence was handled properly."
Defense: "But databases can be edited."
✗ No visual proof
```

Hash Chain System:
```
"Here's the cryptographic chain. Each hash depends on the previous one.
See this - custody event 3 matches the computation.
Any tampering would break the visual chain and is cryptographically provable."
Defense: "..." (no rebuttal possible)
✓ Visual + cryptographic proof
```

---

#### **Database Cannot Replicate This**

**Scenario: Admin tries to insert fake custody event**

Traditional DB:
```sql
INSERT INTO custody_log (evidence_id, action, handler, timestamp)
VALUES (123, 'ACCESSED', 'BadActor', '2024-01-10 12:00:00');
```
Result: ✓ Succeeds, looks legitimate

Hash Chain System:
```
Admin inserts fake event with hash: 0xFAKEHASH
↓
Next event computes: H = SHA256(0xFAKEHASH + ...)
↓
Stored hash for next event: 0x5e9f3d2c...
↓
Mismatch! Chain broken visually and cryptographically
↓
System flags tampering automatically
```

---

## 4️⃣ Public Evidence Verification

### Overview

A **public verification interface** allows anyone (including defendants, journalists, or oversight bodies) to verify evidence integrity without system access, using only the blockchain as source of truth.

---

### Design Principles

1. **No Login Required** - Open access for maximum transparency
2. **Privacy Preserved** - No evidence content revealed
3. **Cryptographic Proof** - Verification is mathematical, not trust-based
4. **Blockchain-Backed** - Results verifiable on public blockchain

---

### User Flow

```
┌─────────────────────────────────────┐
│  Public Verification Portal         │
│  https://verify.evidencevault.gov   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Step 1: Enter Evidence ID          │
│  ┌─────────────────────────────┐   │
│  │ Evidence ID: EV-2024-001    │   │
│  └─────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Step 2: Upload File                │
│  ┌─────────────────────────────┐   │
│  │  Drag & drop or click       │   │
│  │  📁 video_evidence.mp4       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ Privacy Notice:                 │
│  File processed locally in browser. │
│  Only hash sent to blockchain.      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Step 3: Browser Computes Hash      │
│  SHA-256: 0x8f434346648f6b96...     │
│  (No file uploaded to server)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Step 4: Query Blockchain           │
│  Contract: 0x742d35Cc6634C0532925... │
│  Function: getEvidence(evidenceId)  │
│  Network: Ethereum Sepolia          │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
    ✅ MATCH      ❌ MISMATCH
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────────┐
│ VERIFIED ✓   │  │ TAMPERED ✗       │
│              │  │                  │
│ Blockchain:  │  │ Expected:        │
│ 0x8f43...    │  │ 0x8f43...        │
│              │  │                  │
│ Your File:   │  │ Your File:       │
│ 0x8f43...    │  │ 0xFFFF...        │
│              │  │                  │
│ ✓ Hashes     │  │ ✗ Hash Mismatch  │
│   Match      │  │                  │
│              │  │ ⚠️ File Modified  │
└──────────────┘  └──────────────────┘
```

---

### Implementation: Public Verification Page

```tsx
export function PublicVerificationPortal() {
  const [evidenceId, setEvidenceId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  async function handleVerify() {
    if (!evidenceId || !file) return;
    
    setVerifying(true);
    
    try {
      // 1. Compute SHA-256 hash in browser (privacy-preserving)
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // 2. Query blockchain (read-only, no authentication)
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      const evidence = await contract.getEvidence(evidenceId);
      const blockchainHash = evidence.evidenceHash;
      
      // 3. Compare hashes
      const verified = computedHash.toLowerCase() === blockchainHash.toLowerCase();
      
      // 4. Get blockchain proof
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      
      setResult({
        verified,
        evidenceId,
        fileName: file.name,
        computedHash,
        blockchainHash,
        caseId: evidence.caseId,
        registrationTime: new Date(evidence.timestamp * 1000).toISOString(),
        verificationTime: new Date().toISOString(),
        blockchainBlock: blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
        custodyEventCount: evidence.custodyEventCount
      });
      
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({
        verified: false,
        error: error.message
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="public-verification-portal">
      {/* Header */}
      <div className="portal-header">
        <h1>Public Evidence Verification</h1>
        <p>Verify evidence integrity using blockchain proof</p>
        <Badge variant="info">No login required • Privacy-preserving</Badge>
      </div>

      {/* Input Section */}
      {!result && (
        <Card className="verification-input">
          <CardContent className="space-y-6">
            {/* Evidence ID Input */}
            <div>
              <label className="font-medium">Evidence ID</label>
              <Input
                placeholder="e.g., EV-2024-001 or 12345"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Available on evidence documentation or court filings
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="font-medium">Evidence File</label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {file ? (
                  <div>
                    <FileText className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p>Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500">File processed locally - never uploaded</p>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-semibold text-blue-900 mb-1">Privacy Guarantee</h4>
                  <p className="text-blue-700">
                    Your file is processed entirely in your browser. Only the cryptographic hash 
                    is compared with the blockchain. The file content is never transmitted.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={!evidenceId || !file || verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying on Blockchain...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Verify Evidence
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <Card className={result.verified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-8">
            {/* Result Header */}
            <div className="text-center mb-6">
              {result.verified ? (
                <div>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-900">Evidence Verified ✓</h2>
                  <p className="text-green-700 mt-2">File integrity confirmed by blockchain</p>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-900">Verification Failed ✗</h2>
                  <p className="text-red-700 mt-2">Hash mismatch - file may have been modified</p>
                </div>
              )}
            </div>

            {/* Verification Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Evidence ID:</span>
                  <p className="font-mono font-medium">{result.evidenceId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Case ID:</span>
                  <p className="font-medium">{result.caseId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Registration Date:</span>
                  <p className="font-medium">{new Date(result.registrationTime).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Verification Date:</span>
                  <p className="font-medium">{new Date(result.verificationTime).toLocaleString()}</p>
                </div>
              </div>

              {/* Hash Comparison */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Cryptographic Hashes:</h3>
                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-500">Blockchain:</span>
                    <p className={result.verified ? 'text-green-700' : 'text-red-700'}>
                      {result.blockchainHash}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Your File:</span>
                    <p className={result.verified ? 'text-green-700' : 'text-red-700'}>
                      {result.computedHash}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockchain Proof */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Blockchain Proof:</h3>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Network:</span>
                    <span className="font-medium">Ethereum Sepolia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Block Number:</span>
                    <span className="font-mono">{result.blockchainBlock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custody Events:</span>
                    <span className="font-medium">{result.custodyEventCount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {/* Generate PDF report */}}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Proof
                </Button>
                <Button
                  onClick={() => setResult(null)}
                >
                  Verify Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Public Verification Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold">Local Hash Computation</h4>
              <p className="text-sm text-slate-600">
                Your browser computes the SHA-256 hash of your file. The file never leaves your device.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold">Blockchain Query</h4>
              <p className="text-sm text-slate-600">
                The system queries the public blockchain to retrieve the registered evidence hash.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold">Cryptographic Comparison</h4>
              <p className="text-sm text-slate-600">
                If the hashes match, the file is authentic. If not, the file has been modified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Why Public Verifiability Matters

#### **Legal System Benefits**

**1. Defendant Rights**
```
Scenario: Defendant claims evidence was tampered with

Traditional System:
- Relies on prosecution's word
- No independent verification
- "Trust us" approach

Public Verification:
- Defendant can verify independently
- Cryptographic proof
- Results admissible in court
- Strengthens due process
```

**2. Journalism & Oversight**
```
Investigative journalist wants to verify evidence cited in court filing

Public Portal:
- No credentials needed
- Evidence ID from court documents
- Independent verification
- Expose tampering attempts
```

**3. Appeal Process**
```
Years later, defendant appeals based on evidence integrity

Public Blockchain:
- Historical verification still possible
- Original hash immutable
- Chain of custody retrievable
- Truth persists indefinitely
```

---

#### **Privacy Preservation**

**What's Public:**
- Evidence ID
- Cryptographic hash (meaningless without file)
- Timestamps
- Custody event count

**What's NOT Public:**
- File content
- Evidence details
- Case-sensitive information
- Victim/suspect identities

**Privacy Mechanism:**
```
Hash = SHA-256(file_content)

Given hash: 0x8f434346648f6b96...
↓
Impossible to reverse-engineer file content
↓
Privacy preserved while enabling verification
```

---

## 5️⃣ Multi-Node Attestation System

### Overview

**Multi-Node Attestation** distributes verification trust across multiple independent parties, creating a decentralized consensus on evidence integrity.

---

### Architecture

```
┌──────────────────────────────────────┐
│   Evidence Upload                    │
│   File: video_evidence.mp4           │
│   Hash: 0x8f434346...                │
└──────────────┬───────────────────────┘
               │
               │ Registered on Blockchain
               ▼
┌──────────────────────────────────────┐
│   Verification Request Emitted       │
│   → Listening Verifier Nodes         │
└──────────────┬───────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │
│ FBI    │ │ State  │ │ Indep. │
│ Lab    │ │ Police │ │ Auditor│
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    │ Verify   │ Verify   │ Verify
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Hash OK│ │Hash OK│ │Hash OK│
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └────┬─────┴─────┬────┘
         │           │
         ▼           ▼
┌──────────────────────────────────────┐
│  Blockchain: Multiple Attestations   │
│  → 3/3 Nodes Verified Evidence ✓     │
│                                      │
│  Consensus: VERIFIED                 │
└──────────────────────────────────────┘
```

---

### Smart Contract Extension

```solidity
/**
 * @title Multi-Node Attestation
 * @notice Allows multiple independent verifiers to attest to evidence integrity
 */
contract EvidenceRegistry {
    
    struct Attestation {
        address verifier;
        bool verified;
        uint256 timestamp;
        string verifierName; // "FBI Lab", "State Police", etc.
    }
    
    // evidenceId => array of attestations
    mapping(uint256 => Attestation[]) private _attestations;
    
    // Registered verifier nodes
    mapping(address => bool) public isRegisteredVerifier;
    
    event VerificationAttested(
        uint256 indexed evidenceId,
        address indexed verifier,
        bool verified,
        uint256 timestamp
    );
    
    event ConsensusReached(
        uint256 indexed evidenceId,
        uint256 attestationCount,
        uint256 verifiedCount
    );
    
    /**
     * @notice Register as verification node
     */
    function registerAsVerifier() external {
        isRegisteredVerifier[msg.sender] = true;
    }
    
    /**
     * @notice Attest to evidence verification
     * @param evidenceId Evidence to attest
     * @param verified Result of verification
     */
    function attestVerification(
        uint256 evidenceId,
        bool verified
    ) external evidenceExists(evidenceId) {
        require(isRegisteredVerifier[msg.sender], "Not registered verifier");
        
        // Check not already attested
        Attestation[] storage attestations = _attestations[evidenceId];
        for (uint i = 0; i < attestations.length; i++) {
            require(attestations[i].verifier != msg.sender, "Already attested");
        }
        
        // Add attestation
        attestations.push(Attestation({
            verifier: msg.sender,
            verified: verified,
            timestamp: block.timestamp,
            verifierName: "" // Set off-chain
        }));
        
        emit VerificationAttested(
            evidenceId,
            msg.sender,
            verified,
            block.timestamp
        );
        
        // Check consensus (e.g., 3 attestations)
        if (attestations.length >= 3) {
            uint256 verifiedCount = 0;
            for (uint i = 0; i < attestations.length; i++) {
                if (attestations[i].verified) verifiedCount++;
            }
            
            emit ConsensusReached(
                evidenceId,
                attestations.length,
                verifiedCount
            );
        }
    }
    
    /**
     * @notice Get attestation count
     */
    function getAttestationCount(uint256 evidenceId)
        external
        view
        evidenceExists(evidenceId)
        returns (uint256)
    {
        return _attestations[evidenceId].length;
    }
    
    /**
     * @notice Get specific attestation
     */
    function getAttestation(uint256 evidenceId, uint256 index)
        external
        view
        evidenceExists(evidenceId)
        returns (Attestation memory)
    {
        require(index < _attestations[evidenceId].length, "Index out of bounds");
        return _attestations[evidenceId][index];
    }
}
```

---

### Verifier Node Implementation

```javascript
/**
 * Independent Verifier Node
 * Monitors blockchain for evidence registrations and attests to integrity
 */
class VerifierNode {
  constructor(config) {
    this.nodeId = config.nodeId;
    this.nodeName = config.nodeName; // "FBI Crime Lab"
    this.privateKey = config.privateKey;
    this.contract = config.contract;
  }

  /**
   * Start monitoring blockchain
   */
  async start() {
    console.log(`Verifier Node ${this.nodeName} starting...`);
    
    // Listen for evidence registrations
    this.contract.on("EvidenceRegistered", async (evidenceId, hash, caseId) => {
      console.log(`New evidence registered: ${evidenceId}`);
      await this.verifyAndAttest(evidenceId, hash);
    });
    
    console.log(`Verifier Node ${this.nodeName} active`);
  }

  /**
   * Verify evidence and attest on blockchain
   */
  async verifyAndAttest(evidenceId, expectedHash) {
    try {
      // 1. Retrieve evidence file (from secure storage)
      const evidenceFile = await this.retrieveEvidence(evidenceId);
      
      // 2. Compute hash
      const computedHash = await this.computeHash(evidenceFile);
      
      // 3. Compare hashes
      const verified = computedHash === expectedHash;
      
      console.log(`Evidence ${evidenceId}: ${verified ? 'VERIFIED' : 'TAMPERED'}`);
      
      // 4. Attest on blockchain
      const tx = await this.contract.attestVerification(evidenceId, verified);
      await tx.wait();
      
      console.log(`Attestation recorded for Evidence ${evidenceId}`);
      
      // 5. If tamper detected, alert authorities
      if (!verified) {
        await this.alertTampering(evidenceId, expectedHash, computedHash);
      }
      
    } catch (error) {
      console.error(`Verification failed for ${evidenceId}:`, error);
    }
  }

  async retrieveEvidence(evidenceId) {
    // Retrieve from secure evidence storage
    // Implementation depends on storage system
  }

  async computeHash(file) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(file);
    return '0x' + hash.digest('hex');
  }

  async alertTampering(evidenceId, expected, computed) {
    // Send alerts to authorities
    console.error(`🚨 TAMPERING DETECTED: Evidence ${evidenceId}`);
    console.error(`Expected: ${expected}`);
    console.error(`Computed: ${computed}`);
    
    // Notify internal affairs, supervisors, etc.
  }
}

// Example: Deploy multiple nodes
const fbiNode = new VerifierNode({
  nodeId: 1,
  nodeName: "FBI Crime Lab",
  privateKey: process.env.FBI_NODE_KEY,
  contract: evidenceContract
});

const stateNode = new VerifierNode({
  nodeId: 2,
  nodeName: "State Police Forensics",
  privateKey: process.env.STATE_NODE_KEY,
  contract: evidenceContract
});

const independentNode = new VerifierNode({
  nodeId: 3,
  nodeName: "Independent Auditor",
  privateKey: process.env.INDEPENDENT_NODE_KEY,
  contract: evidenceContract
});

// Start all nodes
await Promise.all([
  fbiNode.start(),
  stateNode.start(),
  independentNode.start()
]);
```

---

### Trust Model

**Single Authority (Traditional):**
```
FBI says evidence is authentic
→ Court trusts FBI
→ Defense: "But FBI could be corrupt"
→ Trust-based system
```

**Multi-Node Consensus:**
```
FBI Node:         Evidence authentic ✓  [Block 8472910]
State Police:     Evidence authentic ✓  [Block 8472915]
Independent:      Evidence authentic ✓  [Block 8472920]

Consensus: 3/3 verified
→ Collusion between 3 independent entities highly unlikely
→ All attestations on public blockchain
→ Defense cannot claim single-authority bias
→ Cryptographically provable
```

---

### Why This Increases Trust

#### **Decentralization of Authority**
- No single entity has verification monopoly
- Tampering requires compromising multiple independent parties
- Each party has reputational stake

#### **Transparent Verification**
- All attestations public on blockchain
- Timestamped independently
- Cannot be backdated or altered

#### **Accountability**
- Each verifier's address linked to attestation
- False attestations traceable
- Cryptographic signatures bind identity to claim

---

*Continued in next section...*
