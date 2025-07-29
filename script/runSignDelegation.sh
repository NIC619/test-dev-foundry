#!/bin/bash

# The reason we use a shell script instead of a simple `forge script` is because
# `forge script` will use the latest block to simulate the transactions by default
# but it often fails to fetch the latest block due to fast block times and unstable RPC endpoint.
# This script fetches the latest block number, converts it to decimal, and subtracts 5 to get a stable block number.

# Define RPC URL
RPC_URL="https://testnet-unifi-rpc.puffer.fi/"
# RPC_URL="https://rpc.hoodi.ethpandaops.io"

# Fetch latest block number (in decimal)
LATEST_BLOCK=$(curl -s -X POST \
  --header "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_URL | jq -r '.result')

# Check if curl or jq failed
if [ -z "$LATEST_BLOCK" ] || [ "$LATEST_BLOCK" == "null" ]; then
  echo "Failed to fetch latest block number"
  exit 1
fi

# Convert hex to decimal and subtract 5
BLOCK_NUMBER=$(( $(printf "%d" "$LATEST_BLOCK") - 5 ))

echo "Using fork block number: $BLOCK_NUMBER for simulation"

# Run forge script with adjusted block number
forge script script/SignDelegationScript.s.sol \
  --broadcast \
  --rpc-url $RPC_URL \
  --fork-block-number $BLOCK_NUMBER