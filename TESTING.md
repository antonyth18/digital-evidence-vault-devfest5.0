# System Integration Testing Guide

This guide describes how to verify the full end-to-end integration of the Digital Evidence Vault.

## 1. Prerequisites
- **Blockchain Node**: Running (`npm run node` in `blockchain/`)
- **Backend Server**: Running (`npm start` in `backend/`)
- **Frontend App**: Running (`npm run dev` in `frontend/`)
- **Contract Deployed**: (`npm run deploy:local` in `blockchain/`)

## 2. Feature Verification

### A. Evidence Registration & Proof (Evidence Vault)
1.  Go to **Upload Evidence**.
2.  Select any file (e.g., `witness_statement.pdf`).
3.  Enter a Case ID (e.g., `CASE-2024-X`).
4.  Click **Upload & Anchor**.
5.  **Verify**: The upload should complete with "Successfully Anchored on Blockchain".
6.  **Verify**: Navigate to **Evidence Vault**. Your file should appear at the top.
7.  **Verify**: Click "View Details" on the new item. You should see the Blockchain Transaction Hash and Block Number.

### B. AI Risk Sensing (Alerts)
1.  Go to **Upload Evidence**.
2.  Upload a file that triggers AI risk (e.g., a file named `evidence_modified.jpg` with arbitrary contents).
3.  **Verify**: An "AI Warning" should appear during the step 2 preview.
4.  Proceed with the upload.
5.  Go to the **Alerts** page.
6.  **Verify**: A "high" severity alert should appear for your Evidence ID (reason: AI detected anomaly).

### C. Integrity Verification (Tamper Ledger)
1.  In the **Evidence Vault**, click "Verify" on an item.
2.  Upload the **CORRECT** file.
    - **Verify**: Success message.
3.  Upload a **DIFFERENT** file (or the same file modified).
    - **Verify**: "TAMPER DETECTED" message.
4.  Go to the **Alerts** page.
    - **Verify**: A new alert from "BLOCKCHAIN VALIDATOR" should appear.

### D. System Auditing (Audit Log)
1.  Go to the **Audit Log** page.
2.  **Verify**: You should see a chronological feed of:
    - `Evidence Registered` (whenever you anchor a file).
    - `Integrity Alert Raised` (whenever AI or Verification detects an issue).
3.  **Verify**: Each entry has a unique Ref ID and timestamp.

### E. Chain of Custody (On-Chain Audit)
1.  Go to the **Chain of Custody** page.
2.  Select your Evidence ID from the dropdown.
3.  **Verify**: The timeline shows the `INITIAL_REGISTRATION` event.
4.  (Advanced) Use `curl` to manually log a custody move:
    ```bash
    curl -X POST http://localhost:3001/api/custody/<YOUR_EVIDENCE_ID>/log \
    -H "Content-Type: application/json" \
    -d '{"action": "TRANSFER", "handler": "Officer Smith", "details": {"to": "Property Room B"}}'
    ```
5.  Refresh the **Chain of Custody** page.
    - **Verify**: The "TRANSFER" event now appears on the timeline with a "Signature Valid" badge.

## 3. Troubleshooting
- **No data in Vault?**: Ensure the backend started successfully (check logs for contract connection).
- **Upload fails?**: Check if Hardhat node is running and has enough ETH (local accounts are funded by default).
- **Blockchain "DISABLED"?**: Re-run `npm run deploy:local` in the blockchain folder and restart the backend.
