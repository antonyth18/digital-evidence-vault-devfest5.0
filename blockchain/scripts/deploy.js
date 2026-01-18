const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n═══════════════════════════════════════════════════");
    console.log("   Deploying Evidence Registry Smart Contract");
    console.log("═══════════════════════════════════════════════════\n");

    const [deployer, verifier1, verifier2, verifier3] = await hre.ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Deploy contract
    console.log("Deploying EvidenceRegistry contract...");
    const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
    const evidenceRegistry = await EvidenceRegistry.deploy();

    await evidenceRegistry.waitForDeployment();
    const contractAddress = await evidenceRegistry.getAddress();

    console.log("\n✅ EvidenceRegistry deployed to:", contractAddress);

    // Register verifier nodes for attestation
    console.log("\n📝 Registering verifier nodes...");
    await evidenceRegistry.connect(verifier1).registerAsVerifier();
    await evidenceRegistry.connect(verifier2).registerAsVerifier();
    await evidenceRegistry.connect(verifier3).registerAsVerifier();
    console.log("   Verifier 1:", verifier1.address);
    console.log("   Verifier 2:", verifier2.address);
    console.log("   Verifier 3:", verifier3.address);

    // Get action hashes
    console.log("\n📋 Action Constants:");
    const actions = ["COLLECTED", "ACCESSED", "TRANSFERRED", "VERIFIED", "ANALYZED", "VIOLATION"];
    const actionHashes = {};
    for (const action of actions) {
        const hash = await evidenceRegistry.getActionHash(action);
        actionHashes[action] = hash;
        console.log(`  ${action}: ${hash}`);
    }

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: contractAddress,
        deployer: deployer.address,
        verifiers: [
            verifier1.address,
            verifier2.address,
            verifier3.address
        ],
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        timestamp: new Date().toISOString(),
        actions: actionHashes
    };

    fs.writeFileSync(
        path.join(__dirname, '../deployment-info.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Create backend .env file
    const backendEnvPath = path.join(__dirname, '../../backend/.env');
    const envContent = `PORT=3001

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=${contractAddress}
PRIVATE_KEY=${deployer.privateKey || ''}

# Verifier Keys (for attestation)
VERIFIER1_KEY=${verifier1.privateKey || ''}
VERIFIER2_KEY=${verifier2.privateKey || ''}
VERIFIER3_KEY=${verifier3.privateKey || ''}

# Network
NETWORK=local

# Features
ENABLE_POLICY_ENGINE=true
ENABLE_AI_SCORING=true
AI_RISK_THRESHOLD=70
`;

    fs.writeFileSync(backendEnvPath, envContent);
    console.log("\n💾 Deployment info saved:");
    console.log("   - deployment-info.json");
    console.log("   - backend/.env");

    console.log("\n═══════════════════════════════════════════════════");
    console.log("   Deployment Complete!");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("Next steps:");
    console.log("1. Contract deployed at:", contractAddress);
    console.log("2. Backend .env file created with contract address");
    console.log("3. Restart backend: cd backend && npm run dev");
    console.log("4. Frontend will auto-connect to blockchain");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
