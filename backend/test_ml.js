const aiRiskScoring = require('./services/aiRiskScoring');

async function test() {
    console.log("Testing AI Risk Scoring...");

    // Test 1: Text Analysis (Positive)
    const textBuffer = Buffer.from("This is a normal evidence file reporting some facts.");
    const metadataText = { fileName: "report.txt", mimeType: "text/plain", fileSize: 100 };
    const res1 = await aiRiskScoring.analyzeEvidence(textBuffer, metadataText);
    console.log("\nText Result (Neutral):", JSON.stringify(res1, null, 2));

    // Test 2: Text Analysis (Negative/Hostile)
    const hostileBuffer = Buffer.from("I hate you and I will destroy everything. This is terrible.");
    const res2 = await aiRiskScoring.analyzeEvidence(hostileBuffer, metadataText);
    console.log("\nText Result (Hostile):", JSON.stringify(res2, null, 2));

    process.exit(0);
}

test();
