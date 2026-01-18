# 🚀 Deployment & Testing Guide

## Digital Evidence Vault - Complete Blockchain Integration

---

## ⚡ Quick Start (Automated)

```bash
# From project root
./setup-all.sh
```

This automatically:
1. Compiles Solidity contract
2. Starts local blockchain
3. Deploys EvidenceRegistry contract
4. Starts backend with blockchain integration
5. Starts frontend

**Everything will be running and ready to test!**

---

## 📋 Manual Setup (Step-by-Step)

### Step 1: Blockchain Setup

```bash
# Terminal 1: Start local blockchain
cd blockchain
npm install
npx hardhat node

# Keep this running!
```

### Step 2: Deploy Smart Contract

```bash
# Terminal 2: Deploy contract
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Output:**
```
✅ EvidenceRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📝 Registering verifier nodes...
   Verifier 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Verifier 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   Verifier 3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

✅ **backend/.env automatically created with CONTRACT_ADDRESS**

### Step 3: Start Backend

```bash
# Terminal 3: Start backend
cd backend
npm install
npm run dev
```

**Expected Output:**
```
═══════════════════════════════════════════════════
   Digital Evidence Vault - Backend Server
═══════════════════════════════════════════════════
   Server running on port 3001
   Blockchain Integration: ✅ ENABLED
   Policy Engine: ✅ ENABLED
   AI Risk Scoring: ✅ ENABLED
```

### Step 4: Start Frontend

```bash
# Terminal 4: Start frontend
cd frontend
npm run dev
```

Open: **http://localhost:5173**

---

## 🧪 Testing End-to-End Flows

### Test 1: Evidence Registration (Item #1)

**Steps:**
1. Go to Upload Evidence page
2. Select a file (any file - PDF, image, video)
3. Enter Case ID: `CR-2024-TEST`
4. Click "Upload & Register on Blockchain"

**Expected Result:**
```json
{
  "success": true,
  "evidence": {
    "evidenceId": "1",
    "txHash": "0x...",
    "blockNumber": 2
  },
  "blockchain": {
    "explorerUrl": "https://sepolia.etherscan.io/tx/0x..."
  }
}
```

**Verification:**
- ✅ Evidence ID displayed
- ✅ Transaction hash shown with clickable link
- ✅ Block number displayed
- ✅ Success state shows blockchain proof

---

### Test 2: Custody Logging (Item #2)

**Steps:**
1. Go to Chain of Custody page
2. Enter Evidence ID: `1`
3. Click "Log New Event"
4. Select Action: `ANALYZED`
5. Submit

**Expected Result:**
- ✅ New event appears on timeline
- ✅ Transaction hash displayed
- ✅ Event reads from blockchain (not mock data)
- ✅ Refresh page → events persist (blockchain source)

**Backend Logs:**
```
📋 Logging custody event for Evidence #1
   Action: ANALYZED
   Transaction sent: 0x...
   Transaction confirmed in block: 3
```

---

### Test 3: Policy Violation (Item #3)

**Steps:**
1. Log custody event: `COLLECTED` for Evidence #1
2. Try to log `VERIFIED` (skipping SEALED) 
3. Backend should reject

**Expected Result:**
```json
{
  "success": false,
  "blocked": true,
  "reason": "INVALID_CUSTODY_ORDER",
  "details": "Cannot skip required steps: SEALED",
  "blockchain": {
    "txHash": "0x...",
    "event": "VIOLATION"
  }
}
```

**Verification:**
- ✅ Action blocked
- ✅ Violation logged on blockchain
- ✅ Frontend shows "Blocked by policy"

---

### Test 4: Tamper Detection (Item #4)

**Scenario A: Verification PASSES**

**Steps:**
1. Go to Verification page
2. Enter Evidence ID: `1`
3. Upload **THE SAME FILE** you registered
4. Click "Verify"

**Expected Result:**
```json
{
  "verified": true,
  "blockchain": {
    "txHash": "0x...",
    "event": "VerificationPassed",
    "explorerUrl": "https://..."
  }
}
```

**Frontend:**
- ✅ Green success state
- ✅ "Evidence integrity verified" message
- ✅ Blockchain proof link displayed

---

**Scenario B: Tamper DETECTED**

**Steps:**
1. Go to Verification page
2. Enter Evidence ID: `1`
3. Upload **A DIFFERENT FILE**
4. Click "Verify"

**Expected Result:**
```json
{
  "verified": false,
  "tampered": true,
  "blockchain": {
    "txHash": "0x...",
    "event": "TamperDetected",
    "expectedHash": "0x8f43...",
    "submittedHash": "0x2a19..."
  }
}
```

**Frontend:**
- ✅ Red error state  
- ✅ "TAMPER DETECTED" message
- ✅ Hash mismatch shown
- ✅ Blockchain proof of tampering displayed
- ✅ Explorer link to TamperDetected event

**Blockchain Explorer:**
```
Event: TamperDetected
  evidenceId: 1
  verifier: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  expectedHash: 0x8f434346648f6b96...
  submittedHash: 0x2a194c8d9e7f5b3a...
```

---

### Test 5: Multi-Node Attestation (Item #5)

**Steps:**
1. Upload evidence (Evidence ID: `2`)
2. API call: `POST /api/attestations/run` with `evidenceId: 2`

**Backend Process:**
```javascript
// Runs 3 verifications from different accounts
Verifier 1 (FBI): verifyEvidence(2, correctHash) → VERIFIED
Verifier 2 (State): verifyEvidence(2, correctHash) → VERIFIED  
Verifier 3 (Independent): verifyEvidence(2, correctHash) → VERIFIED
```

**Expected Result:**
```json
{
  "attestations": [
    { "verifier": "0x7099...", "verified": true, "txHash": "0x..." },
    { "verifier": "0x3C44...", "verified": true, "txHash": "0x..." },
    { "verifier": "0x90F7...", "verified": true, "txHash": "0x..." }
  ],
  "consensus": "3/3 VERIFIED"
}
```

**Frontend Display:**
```
Independent Attestations: 3/3 VERIFIED ✓
- FBI Crime Lab: tx 0xABC... [View on Explorer]
- State Police: tx 0xDEF... [View on Explorer]
- Independent Auditor: tx 0x123... [View on Explorer]
```

---

### Test 6: AI Risk Scoring (Item #6)

**Scenario A: Clean File**

**Steps:**
1. Upload evidence page
2. Upload file: `clean_document.pdf`
3. AI analysis runs automatically

**Expected Result:**
```json
{
  "riskScore": 15,
  "confidence": 0.95,
  "recommendation": "AUTO_APPROVE",
  "signals": [],
  "explanation": "No anomalies detected. File appears authentic."
}
```

**Frontend:**
- ✅ Green badge: "Low Risk (15/100)"
- ✅ Auto-approved for registration

---

**Scenario B: Suspicious File**

**Steps:**
1. Upload file named: `modified_evidence_copy.mp4`
2. AI analysis runs

**Expected Result:**
```json
{
  "riskScore": 85,
  "confidence": 0.91,
  "recommendation": "FORENSIC_REVIEW_REQUIRED",
  "signals": [
    "METADATA_ANOMALY",
    "UNEXPECTED_RE_ENCODING",
    "HIGH_ENTROPY_DETECTED"
  ],
  "explanation": "High-risk indicators detected: File shows signs of re-encoding..."
}
```

**Frontend:**
- ⚠️ Red badge: "High Risk (85/100)"
- ⚠️ "Forensic review required" banner
- ⚠️ Registration blocked until manual approval

---

## 🔍 Verification on Blockchain Explorer

### For Local Development:

Transactions are on local blockchain. Use Hardhat console:

```bash
cd blockchain
npx hardhat console --network localhost

const EvidenceRegistry = await ethers.getContractAt(
  "EvidenceRegistry",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
);

// Get evidence
const evidence = await EvidenceRegistry.getEvidence(1);
console.log(evidence);

// Get custody events  
const eventCount = await EvidenceRegistry.getCustodyEventCount(1);
for (let i = 0; i < eventCount; i++) {
  const event = await EvidenceRegistry.getCustodyEvent(1, i);
  console.log(event);
}

// Get attestations
const attestationCount = await EvidenceRegistry.getAttestationCount(1);
console.log(`Attestations: ${attestationCount}`);
```

### For Testnet (Sepolia):

1. Deploy to Sepolia: `npx hardhat run scripts/deploy.js --network sepolia`
2. View transactions on: **https://sepolia.etherscan.io**
3. Search for contract address
4. See all events: `EvidenceRegistered`, `CustodyEventLogged`, `TamperDetected`, etc.

---

## 🐛 Troubleshooting

### Issue: "Blockchain not available"

**Fix:**
```bash
# Check if Hardhat node is running
lsof -i :8545

# If not running, start it
cd blockchain
npx hardhat node
```

### Issue: Backend can't connect to blockchain

**Check backend/.env:**
```bash
CONTRACT_ADDRESS=0x5FbDB2... # Must match deployed address
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

**Restart backend:**
```bash
cd backend
npm run dev
```

### Issue: Contract not deployed

**Redeploy:**
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### Issue: Transaction reverts

**Common causes:**
- Evidence ID doesn't exist
- Hash already registered
- Action violates policy

**Check backend logs for detailed error.**

---

## 📊 Expected Gas Costs

| Operation | Gas Used | Local Dev Cost |
|-----------|----------|----------------|
| Register Evidence | ~120,000 | Free (local) |
| Log Custody Event | ~60,000 | Free (local) |
| Verify Evidence | ~80,000 | Free (local) |
| Log Attestation | ~55,000 | Free (local) |

**Local blockchain = unlimited free gas**

---

## ✅ Success Checklist

Before demo/presentation, verify:

- [ ] Blockchain node running on :8545
- [ ] Contract deployed with valid address
- [ ] Backend shows "Blockchain Integration: ✅ ENABLED"
- [ ] Frontend can upload and get Evidence ID
- [ ] Custody events read from blockchain
- [ ] Tamper detection emits on-chain event
- [ ] AI risk scoring returns scores
- [ ] Explorer links work (or Hardhat console verification)

---

## 🎯 Demo Script

**1. Upload Evidence** (30 seconds)
- Upload file → Show Evidence ID + tx hash
- Click explorer link → Show EvidenceRegistered event

**2. Add Custody Events** (30 seconds)
- Log custody event → Show tx hash
- Refresh page → Events persist (blockchain source)

**3. Demonstrate Tamper Detection** (60 seconds)
- Verify correct file → Success
- Verify wrong file → Tamper detected + blockchain proof

**4. Show Multi-Node Attestation** (30 seconds)
- Run attestation → 3 verifiers confirm
- All on blockchain with tx hashes

**5. AI Risk Scoring** (20 seconds)
- Upload suspicious file → High risk flagged
- Show automated screening

**Total:** ~3 minutes for complete end-to-end demo

---

## 🚨 Emergency Recovery

**If everything breaks:**

```bash
# Kill all processes
pkill -f "hardhat node"
pkill -f "node server.js"
pkill -f "npm run dev"

# Fresh start
cd /path/to/project
./setup-all.sh
```

---

**Built with Solidity 0.8.19 + Hardhat + ethers.js v6**
