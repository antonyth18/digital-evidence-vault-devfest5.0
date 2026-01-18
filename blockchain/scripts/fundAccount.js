const { ethers } = require("hardhat");

async function main() {
    // Hardhat's default funded accounts
    const [funder] = await ethers.getSigners();

    // Your MetaMask account address (derived from your private key)
    // Private key: 5dd334e0800f98647e283a5a47c13f3dd671ea86075a381a79af249693b3dccb
    const targetAddress = new ethers.Wallet("5dd334e0800f98647e283a5a47c13f3dd671ea86075a381a79af249693b3dccb").address;

    console.log(`💰 Funding account: ${targetAddress}`);
    console.log(`   From: ${funder.address}`);

    // Send 100 ETH
    const tx = await funder.sendTransaction({
        to: targetAddress,
        value: ethers.parseEther("100")
    });

    await tx.wait();

    console.log(`✅ Sent 100 ETH to ${targetAddress}`);
    console.log(`   Transaction: ${tx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
