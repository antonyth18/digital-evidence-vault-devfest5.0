#!/bin/bash

echo "═══════════════════════════════════════════════════"
echo "   Digital Evidence Vault - Complete Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# Step 1: Compile Solidity Contract
echo "📝 Step 1: Compiling Solidity contract..."
cd blockchain
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi
echo "✅ Contract compiled successfully"
echo ""

# Step 2: Start Local Blockchain (in background)
echo "🚀 Step 2: Starting local blockchain..."
npx hardhat node > /tmp/hardhat-node.log 2>&1 &
HARDHAT_PID=$!
echo "   Blockchain PID: $HARDHAT_PID"
sleep 5
echo "✅ Blockchain running on http://127.0.0.1:8545"
echo ""

# Step 3: Deploy Contract
echo "📦 Step 3: Deploying EvidenceRegistry contract..."
npx hardhat run scripts/deploy.js --network localhost
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    kill $HARDHAT_PID
    exit 1
fi
echo "✅ Contract deployed and backend .env configured"
echo ""

# Step 4: Install Backend Dependencies
echo "📦 Step 4: Installing backend dependencies..."
cd ../backend
npm install > /dev/null 2>&1
echo "✅ Backend dependencies installed"
echo ""

# Step 5: Start Backend
echo "🚀 Step 5: Starting backend server..."
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 3
echo "✅ Backend running on http://localhost:3001"
echo ""

# Step 6: Start Frontend
echo "🚀 Step 6: Starting frontend..."
cd ../frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
sleep 3
echo "✅ Frontend running on http://localhost:5173"
echo ""

echo "═══════════════════════════════════════════════════"
echo "   ✅ ALL SYSTEMS OPERATIONAL"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📊 Service Status:"
echo "   Blockchain: http://127.0.0.1:8545 (PID: $HARDHAT_PID)"
echo "   Backend:    http://localhost:3001 (PID: $BACKEND_PID)"
echo "   Frontend:   http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "📝 Logs:"
echo "   Blockchain: tail -f /tmp/hardhat-node.log"
echo "   Backend:    tail -f /tmp/backend.log"
echo "   Frontend:   tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎯 Open browser: http://localhost:5173"
echo ""
