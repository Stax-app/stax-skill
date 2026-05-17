#!/bin/bash
# Stax CLI Setup — run once after cloning
# Usage: cd cli && ./setup.sh

set -e

echo "Installing dependencies..."
npm install --silent

echo "Building CLI..."
npm run build --silent

echo "Linking globally..."
npm link --silent 2>/dev/null || {
  echo "Note: npm link requires permissions. You can also run:"
  echo "  alias stax=\"node $(pwd)/dist/index.js\""
}

echo ""
echo "Done! Set your API key and you're ready:"
echo "  export STAX_API_KEY=sk_..."
echo ""
echo "Then run:"
echo "  stax              # interactive mode"
echo "  stax account      # check your tier"
echo "  stax --help       # all commands"
