# Homebrew distribution guide

This folder contains templates to publish `myDevDock` through a Homebrew tap.

## Recommended flow

1. Release notarized `.dmg` from GitHub Actions.
2. Update cask `version`, `sha256`, and `url`.
3. Commit/push to your tap repository (for example `luisfarfan/homebrew-mydevdock`).

## Tap structure

In your tap repository, keep:

- `Casks/mydevdock.rb`

You can start from:

- `docs/homebrew/Casks/mydevdock.rb`

## Install from tap

```bash
brew tap <your-org>/<your-tap>
brew install --cask mydevdock
```

## Prepare for `homebrew-cask` official

Before opening a PR to `homebrew-cask`, run:

```bash
brew style Casks/mydevdock.rb
brew audit --cask --strict Casks/mydevdock.rb
```
