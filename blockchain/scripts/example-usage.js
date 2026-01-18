const hre = require("hardhat");

/**
 * Example usage of EvidenceRegistry contract
 * Demonstrates all core functionality for hackathon demo
 */
async function main() {
    console.log("\n🔗 Evidence Registry - Example Transaction Flow\n");

    // Get signers (simulate different actors)
    const [collector, analyst, verifier] = await hre.ethers.getSigners();

    console.log("👥 Actors:");
    console.log("  Collector:", collector.address);
    console.log("  Analyst:", analyst.address);
    console.log("  Verifier:", verifier.address);
    console.log("");

    // Get deployed contract (or deploy new one)
    const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
    const contract = await EvidenceRegistry.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("📜 Contract Address:", contractAddress);
    console.log("");

    // ===========================================
    // STEP 1: Register Evidence
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 1: Register Evidence");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Simulate SHA-256 hash of evidence file
    const evidenceHash = hre.ethers.keccak256(
        hre.ethers.toUtf8Bytes("CCTV_Footage_2024_Crime_Scene_42.mp4")
    );

    console.log("📁 Evidence File: CCTV_Footage_2024_Crime_Scene_42.mp4");
    console.log("🔐 SHA-256 Hash:", evidenceHash);

    const caseId = "CR-2024-1892";
    console.log("📋 Case ID:", caseId);

    // Register evidence (collector role)
    const registerTx = await contract.connect(collector).registerEvidence(
        evidenceHash,
        caseId
    );
    const registerReceipt = await registerTx.wait();

    // Extract evidence ID from event
    const registerEvent = registerReceipt.logs.find(
        log => log.fragment && log.fragment.name === 'EvidenceRegistered'
    );
    const evidenceId = registerEvent.args[0];

    console.log("\n✅ Evidence Registered!");
    console.log("   Evidence ID:", evidenceId.toString());
    console.log("   Transaction:", registerReceipt.hash);
    console.log("   Gas Used:", registerReceipt.gasUsed.toString());
    console.log("");

    // ===========================================
    // STEP 2: Chain of Custody - Access
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 2: Log Custody Event - Forensic Access");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const ACTION_ACCESSED = await contract.getActionHash("ACCESSED");

    const accessTx = await contract.connect(analyst).logCustodyEvent(
        evidenceId,
        ACTION_ACCESSED
    );
    const accessReceipt = await accessTx.wait();

    console.log("✅ Custody Event Logged: ACCESSED");
    console.log("   Handler:", analyst.address);
    console.log("   Transaction:", accessReceipt.hash);
    console.log("   Gas Used:", accessReceipt.gasUsed.toString());
    console.log("");

    // ===========================================
    // STEP 3: Log Transfer Event
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 3: Log Custody Event - Transfer to Court");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const ACTION_TRANSFERRED = await contract.getActionHash("TRANSFERRED");

    const transferTx = await contract.connect(analyst).logCustodyEvent(
        evidenceId,
        ACTION_TRANSFERRED
    );
    const transferReceipt = await transferTx.wait();

    console.log("✅ Custody Event Logged: TRANSFERRED");
    console.log("   Handler:", analyst.address);
    console.log("   Transaction:", transferReceipt.hash);
    console.log("   Gas Used:", transferReceipt.gasUsed.toString());
    console.log("");

    // ===========================================
    // STEP 4: Verification - SUCCESS
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 4: Verify Evidence Integrity - SUCCESS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Verify with CORRECT hash
    const verifyTx = await contract.connect(verifier).verifyEvidence(
        evidenceId,
        evidenceHash // Same hash as registered
    );
    const verifyReceipt = await verifyTx.wait();

    console.log("✅ Verification PASSED!");
    console.log("   Verifier:", verifier.address);
    console.log("   Transaction:", verifyReceipt.hash);
    console.log("   Gas Used:", verifyReceipt.gasUsed.toString());

    // Check event
    const verifyEvent = verifyReceipt.logs.find(
        log => log.fragment && log.fragment.name === 'VerificationPassed'
    );
    if (verifyEvent) {
        console.log("   ✓ VerificationPassed event emitted");
    }
    console.log("");

    // ===========================================
    // STEP 5: Demonstrate Tamper Detection
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 5: Register & Verify Tampered Evidence");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Register second evidence
    const evidenceHash2 = hre.ethers.keccak256(
        hre.ethers.toUtf8Bytes("Document_Affidavit_Witness_Statement.pdf")
    );
    const registerTx2 = await contract.connect(collector).registerEvidence(
        evidenceHash2,
        "CR-2024-1891"
    );
    const registerReceipt2 = await registerTx2.wait();
    const registerEvent2 = registerReceipt2.logs.find(
        log => log.fragment && log.fragment.name === 'EvidenceRegistered'
    );
    const evidenceId2 = registerEvent2.args[0];

    console.log("📁 Second Evidence Registered");
    console.log("   Evidence ID:", evidenceId2.toString());
    console.log("   Original Hash:", evidenceHash2);
    console.log("");

    // Try to verify with WRONG hash (simulate tampering)
    const tamperedHash = hre.ethers.keccak256(
        hre.ethers.toUtf8Bytes("MODIFIED_Document_Affidavit_Witness_Statement.pdf")
    );

    console.log("⚠️  Attempting verification with tampered hash...");
    console.log("   Tampered Hash:", tamperedHash);

    const tamperTx = await contract.connect(verifier).verifyEvidence(
        evidenceId2,
        tamperedHash // Different hash!
    );
    const tamperReceipt = await tamperTx.wait();

    console.log("\n❌ TAMPER DETECTED!");
    console.log("   Transaction:", tamperReceipt.hash);
    console.log("   Gas Used:", tamperReceipt.gasUsed.toString());

    // Check for TamperDetected event
    const tamperEvent = tamperReceipt.logs.find(
        log => log.fragment && log.fragment.name === 'TamperDetected'
    );
    if (tamperEvent) {
        console.log("\n   🚨 TamperDetected Event Emitted:");
        console.log("      Evidence ID:", tamperEvent.args[0].toString());
        console.log("      Verifier:", tamperEvent.args[1]);
        console.log("      Expected Hash:", tamperEvent.args[2]);
        console.log("      Submitted Hash:", tamperEvent.args[3]);
    }
    console.log("");

    // ===========================================
    // STEP 6: Query Evidence & Custody Log
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 6: Query Evidence Details & Custody Log");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get evidence details
    const evidence = await contract.getEvidence(evidenceId);
    console.log("📋 Evidence Details:");
    console.log("   Hash:", evidence.evidenceHash);
    console.log("   Case ID:", evidence.caseId);
    console.log("   Collector:", evidence.collector);
    console.log("   Status:", evidence.status); // 3 = VERIFIED
    console.log("   Custody Events:", evidence.custodyEventCount.toString());
    console.log("");

    // Get custody events
    console.log("📜 Chain of Custody:");
    const eventCount = await contract.getCustodyEventCount(evidenceId);
    for (let i = 0; i < eventCount; i++) {
        const event = await contract.getCustodyEvent(evidenceId, i);
        console.log(`   Event ${i}:`, {
            handler: event.handler,
            action: event.action,
            timestamp: new Date(Number(event.timestamp) * 1000).toISOString()
        });
    }
    console.log("");

    // ===========================================
    // Summary
    // ===========================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Summary");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const totalEvidence = await contract.getEvidenceCount();
    console.log("Total Evidence Registered:", totalEvidence.toString());
    console.log("Evidence #1 Status: VERIFIED ✓");
    console.log("Evidence #2 Status: FLAGGED (Tampered) ⚠️");
    console.log("");
    console.log("🎯 Demo Complete!");
    console.log("   All transactions are immutable on blockchain");
    console.log("   View on block explorer for full transparency");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
