# Evidence Registry - Blockchain Documentation

## 🎯 Overview

The **EvidenceRegistry** smart contract provides a production-grade, tamper-proof evidence integrity system for legal and forensic use cases. It implements cryptographic verification, immutable chain of custody, and provable tamper detection.

---

## 🏗️ Architecture

### Core Design Principles

1. **NO File Storage**: Only cryptographic hashes stored on-chain
2. **IMMUTABLE**: No deletion or modification of records
3. **APPEND-ONLY**: Custody log can only grow
4. **EVENT-DRIVEN**: All actions emit events for off-chain indexing
5. **GAS-OPTIMIZED**: Production-ready efficiency
6. **TAMPER-PROOF**: Cryptographic guarantees

---

## 📊 Data Structures

### Evidence Struct
```solidity
struct Evidence {
    bytes32 evidenceHash;       // SHA-256 hash of file
    string caseId;              // Legal case reference
    address collector;          // Who collected it
    uint256 timestamp;          // When collected
    EvidenceStatus status;      // Current status
    uint256 custodyEventCount;  // Number of custody events
}
```

### CustodyEvent Struct
```solidity
struct CustodyEvent {
    address handler;            // Who performed action
    bytes32 action;             // What action
    uint256 timestamp;          // When
    bytes32 metadataHash;       // Optional metadata reference
}
```

### Status Enum
```solidity
enum EvidenceStatus {
    NONE,           // Not registered
    REGISTERED,     // Successfully registered
    FLAGGED,        // Tamper detected
    VERIFIED        // Integrity verified
}
```

---

## 🔧 Core Functions

### 1. Register Evidence

```solidity
function registerEvidence(
    bytes32 evidenceHash,
    string calldata caseId
) external returns (uint256 evidenceId)
```

**Purpose:** Register new evidence on blockchain

**Parameters:**
- `evidenceHash`: SHA-256 hash of evidence file
- `caseId`: Case identifier for legal tracking

**Returns:** Unique evidence ID

**Events:**
- `EvidenceRegistered(evidenceId, evidenceHash, caseId, collector, timestamp)`
- `CustodyEventLogged` (automatic COLLECTED event)

**Gas Cost:** ~100,000-150,000 gas

---

### 2. Log Custody Event

```solidity
function logCustodyEvent(
    uint256 evidenceId,
    bytes32 action
) external
```

**Purpose:** Log chain of custody event

**Parameters:**
- `evidenceId`: Evidence being handled
- `action`: Type of action (use ACTION_* constants)

**Events:**
- `CustodyEventLogged(evidenceId, handler, action, eventIndex, timestamp)`

**Gas Cost:** ~50,000-80,000 gas

**Action Constants:**
- `ACTION_COLLECTED` = keccak256("COLLECTED")
- `ACTION_ACCESSED` = keccak256("ACCESSED")
- `ACTION_TRANSFERRED` = keccak256("TRANSFERRED")
- `ACTION_VERIFIED` = keccak256("VERIFIED")
- `ACTION_ANALYZED` = keccak256("ANALYZED")

---

### 3. Verify Evidence

```solidity
function verifyEvidence(
    uint256 evidenceId,
    bytes32 submittedHash
) external returns (bool verified)
```

**Purpose:** Verify evidence integrity

**Parameters:**
- `evidenceId`: Evidence to verify
- `submittedHash`: Hash of current file

**Returns:** True if hashes match

**Events (Success):**
- `VerificationPassed(evidenceId, verifier, timestamp)`
- `CustodyEventLogged` (VERIFIED action)

**Events (Failure - TAMPER DETECTED):**
- `TamperDetected(evidenceId, verifier, expectedHash, submittedHash, timestamp)`

**Gas Cost:** ~70,000-100,000 gas

---

## 📡 Events

### EvidenceRegistered
```solidity
event EvidenceRegistered(
    uint256 indexed evidenceId,
    bytes32 indexed evidenceHash,
    string caseId,
    address indexed collector,
    uint256 timestamp
);
```

### CustodyEventLogged
```solidity
event CustodyEventLogged(
    uint256 indexed evidenceId,
    address indexed handler,
    bytes32 action,
    uint256 eventIndex,
    uint256 timestamp
);
```

### TamperDetected (CRITICAL)
```solidity
event TamperDetected(
    uint256 indexed evidenceId,
    address indexed verifier,
    bytes32 expectedHash,
    bytes32 submittedHash,
    uint256 timestamp
);
```

**This event creates an immutable, provable record of tampering.**

---

## 🔍 View Functions

### Get Evidence
```solidity
function getEvidence(uint256 evidenceId) 
    external view returns (Evidence memory)
```

### Get Custody Event
```solidity
function getCustodyEvent(uint256 evidenceId, uint256 eventIndex)
    external view returns (CustodyEvent memory)
```

### Get Custody Event Count
```solidity
function getCustodyEventCount(uint256 evidenceId)
    external view returns (uint256 count)
```

### Check Hash Registered
```solidity
function isHashRegistered(bytes32 evidenceHash) 
    external view returns (bool)
```

### Get Total Evidence Count
```solidity
function getEvidenceCount() 
    external view returns (uint256)
```

---

## ⚡ Gas Optimization Techniques

### 1. Nested Mappings (No Arrays)
```solidity
mapping(uint256 => mapping(uint256 => CustodyEvent)) private _custodyLog;
```
**Why:** O(1) access, no iteration needed, bounded gas costs

### 2. bytes32 for Hashes
```solidity
bytes32 evidenceHash;  // Fixed 32 bytes
```
**Why:** Cheaper than dynamic strings, native EVM type

### 3. Unchecked Arithmetic
```solidity
unchecked {
    _evidenceCounter++;
}
```
**Why:** Safe when overflow impossible, saves gas

### 4. Event-Driven Architecture
```solidity
emit CustodyEventLogged(...);
```
**Why:** Events cheaper than storage, enable off-chain indexing

### 5. Minimize Storage Writes
- Counter instead of array length
- Separate mappings for nested data
- Pack structs efficiently

---

## 🚀 Deployment Strategy

### Local Development (Hardhat)

```bash
# 1. Install dependencies
cd blockchain
npm install

# 2. Start local node
npx hardhat node

# 3. Deploy (in new terminal)
npx hardhat run scripts/deploy.js --network localhost

# 4. Run example
node scripts/example-usage.js
```

### Testnet Deployment (Sepolia)

```bash
# 1. Configure .env
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL

# 2. Deploy
npx hardhat run scripts/deploy.js --network sepolia

# 3. Verify on Etherscan (optional)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Polygon Mumbai Testnet

```bash
# Deploy to Polygon testnet
npx hardhat run scripts/deploy.js --network polygon
```

---

## 🎬 Example Transaction Flow (Demo)

### Scenario: CCTV Evidence Registration → Verification

```javascript
// 1. REGISTER EVIDENCE
const evidenceHash = ethers.keccak256(
    ethers.toUtf8Bytes("CCTV_Footage_Crime_Scene.mp4")
);
const tx1 = await contract.registerEvidence(evidenceHash, "CR-2024-1892");
const receipt1 = await tx1.wait();
const evidenceId = receipt1.events[0].args.evidenceId;

// 2. LOG CUSTODY - Forensic Access
const ACTION_ACCESSED = await contract.getActionHash("ACCESSED");
const tx2 = await contract.logCustodyEvent(evidenceId, ACTION_ACCESSED);
await tx2.wait();

// 3. LOG CUSTODY - Transfer to Court
const ACTION_TRANSFERRED = await contract.getActionHash("TRANSFERRED");
const tx3 = await contract.logCustodyEvent(evidenceId, ACTION_TRANSFERRED);
await tx3.wait();

// 4. VERIFY EVIDENCE
const tx4 = await contract.verifyEvidence(evidenceId, evidenceHash);
const receipt4 = await tx4.wait();
// ✅ VerificationPassed event emitted

// 5. SIMULATE TAMPERING
const tamperedHash = ethers.keccak256(
    ethers.toUtf8Bytes("MODIFIED_CCTV_Footage.mp4")
);
const tx5 = await contract.verifyEvidence(evidenceId, tamperedHash);
const receipt5 = await tx5.wait();
// 🚨 TamperDetected event emitted (permanent blockchain proof!)
```

---

## 🔗 Frontend Integration

### Using ethers.js

```javascript
import { ethers } from 'ethers';
import EvidenceRegistryABI from './EvidenceRegistry.json';

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    EvidenceRegistryABI.abi,
    signer
);

// Register evidence
const hash = ethers.utils.keccak256(fileBytes);
const tx = await contract.registerEvidence(hash, "CR-2024-001");
await tx.wait();

// Listen to events
contract.on("TamperDetected", (evidenceId, verifier, expectedHash, submittedHash) => {
    console.log("🚨 TAMPERING DETECTED!");
    console.log("Evidence:", evidenceId.toString());
    console.log("Expected:", expectedHash);
    console.log("Got:", submittedHash);
});
```

---

## 🧪 Testing

### Run Tests
```bash
npx hardhat test
```

### Test Coverage
- Evidence registration validation
- Custody logging
- Hash verification (success & failure)
- Tamper detection
- Role assignment
- Batch queries
- Gas benchmarks

---

## 🔒 Security Considerations

### ✅ Implemented
- Reentrancy protection (no external calls during state changes)
- Input validation on all functions
- No unbounded loops
- Immutable records (no delete/modify)
- Event-based audit trail
- Hash uniqueness enforcement

### ⚠️ Considerations for Production
1. **Multi-sig deployment** for critical networks
2. **Timelock** for emergency functions (if added)
3. **Access control** can be enhanced with OpenZeppelin AccessControl
4. **Gas limit monitoring** for batch operations

---

## 📈 Performance Metrics

| Operation | Gas Cost | Description |
|-----------|----------|-------------|
| Register Evidence | ~120k | First evidence registration |
| Log Custody Event | ~60k | Add custody entry |
| Verify (Pass) | ~80k | Successful verification |
| Verify (Fail) | ~70k | Tamper detection |
| Get Evidence | 0 | View function (free) |

---

## 🎯 Use Cases

### Court Admissibility
- Immutable blockchain proof of custody
- Timestamp verification
- Handler identification
- Tamper detection

### Internal Investigations
- Audit trail for all evidence handling
- Real-time integrity monitoring
- Chain of custody visualization

### Evidence Transfer
- Cryptographic proof of transfer
- Role-based tracking
- Multi-jurisdiction support

---

## 🆘 Troubleshooting

### Contract not deploying
- Check balance in deployer account
- Verify network configuration in hardhat.config.js
- Check RPC endpoint availability

### Gas estimation failure
- Ensure all required parameters provided
- Check evidence exists before logging custody
- Verify hash is bytes32 (not string)

### Event not emitting
- Wait for transaction confirmation (.wait())
- Check event filters
- Verify network connection

---

## 📚 Additional Resources

- **Solidity Docs**: https://docs.soliditylang.org/
- **Hardhat**: https://hardhat.org/
- **Ethers.js**: https://docs.ethers.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/

---

## 🎓 Further Development

### Recommended Enhancements
1. **IPFS Integration**: Store large metadata on IPFS, reference hash on-chain
2. **Multi-chain**: Deploy to multiple chains for redundancy
3. **Advanced Roles**: Integrate OpenZeppelin AccessControl
4. **Batch Operations**: Add batch registration/verification
5. **Evidence Linking**: Link related evidence items
6. **Expiry Timestamps**: Optional evidence archival dates

---

## 📝 License

MIT License - See LICENSE file for details

---

**Built for Digital Evidence Vault Hackathon**

*Production-grade, courtroom-ready, tamper-proof evidence integrity system.*
