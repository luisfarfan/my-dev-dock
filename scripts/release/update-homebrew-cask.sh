#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <version> <sha256> <owner/repo> <dmg_filename>"
  echo "Example: $0 1.2.3 abc123... luisfarfan/my-dev-dock myDevDock_1.2.3_aarch64.dmg"
  exit 1
fi

VERSION="$1"
SHA="$2"
REPO="$3"
DMG="$4"
CASK_PATH="docs/homebrew/Casks/mydevdock.rb"

if [ ! -f "$CASK_PATH" ]; then
  echo "Cask file not found: $CASK_PATH"
  exit 1
fi

sed -i.bak -E "s/^  version \".*\"$/  version \"${VERSION}\"/" "$CASK_PATH"
sed -i.bak -E "s/^  sha256 \".*\"$/  sha256 \"${SHA}\"/" "$CASK_PATH"
sed -i.bak -E "s#^  url \".*\"#  url \"https://github.com/${REPO}/releases/download/v#{version}/${DMG}\",#" "$CASK_PATH"
rm -f "$CASK_PATH.bak"

echo "Updated ${CASK_PATH}:"
echo "- version: ${VERSION}"
echo "- sha256: ${SHA}"
echo "- url asset: ${DMG}"
