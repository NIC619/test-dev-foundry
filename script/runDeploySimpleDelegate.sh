#!/bin/bash

# The reason we use a shell script instead of a simple `forge script` is because
# `forge script` will use the latest block to simulate the transactions by default
# but it often fails to fetch the latest block due to fast block times and unstable RPC endpoint.
# This script fetches the latest block number, converts it to decimal, and subtracts 5 to get a stable block number.

# Set default values
RPC_URL=${RPC_URL:-"https://testnet-unifi-rpc.puffer.fi/"}
PRIVATE_KEY=${PRIVATE_KEY:-"0x6f6afc2cc8cb7cb0c40c99d0cf334c090fc5f4664feb25debcf01c00d6b8f536"}
VERIFIER_URL=${VERIFIER_URL:-"https://testnet-unifi-explorer.puffer.fi/"}

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable is not set"
    echo "Please set it with: export PRIVATE_KEY=0x..."
    exit 1
fi

echo "Deploying SimpleDelegateContract..."
echo "RPC URL: $RPC_URL"

# Get the latest block number and convert to decimal
LATEST_BLOCK_HEX=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  "$RPC_URL" | jq -r '.result')

if [ "$LATEST_BLOCK_HEX" = "null" ] || [ -z "$LATEST_BLOCK_HEX" ]; then
    echo "Error: Failed to fetch latest block number"
    exit 1
fi

# Convert hex to decimal and subtract 5 for stability
LATEST_BLOCK_DEC=$(printf "%d" "$LATEST_BLOCK_HEX")
STABLE_BLOCK=$((LATEST_BLOCK_DEC - 5))

echo "Latest block: $LATEST_BLOCK_DEC (0x$LATEST_BLOCK_HEX)"
echo "Using stable block: $STABLE_BLOCK"

# Deploy the contract
forge script script/DeploySimpleDelegateContract.s.sol:DeploySimpleDelegateContractScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url "$VERIFIER_URL" \
  --fork-block-number "$STABLE_BLOCK"

echo "Deployment completed!"
