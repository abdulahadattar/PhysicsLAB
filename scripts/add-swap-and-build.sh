#!/bin/bash
# This script adds 2GB of swap space to help prevent out-of-memory errors during large Next.js builds.
# Usage: bash scripts/add-swap-and-build.sh

set -e

SWAPFILE="/swapfile"

if sudo swapon --show | grep -q "$SWAPFILE"; then
  echo "Swap file already exists and is active."
else
  echo "Creating 2GB swap file at $SWAPFILE..."
  sudo fallocate -l 2G $SWAPFILE || sudo dd if=/dev/zero of=$SWAPFILE bs=1M count=2048
  sudo chmod 600 $SWAPFILE
  sudo mkswap $SWAPFILE
  sudo swapon $SWAPFILE
  echo "Swap file created and activated."
fi

free -h

echo "Cleaning up build artifacts..."
rm -rf .next node_modules/.cache

echo "Running Next.js build with debug logging..."
bash scripts/debugg.sh npm run build

echo "Build and debug log complete."
