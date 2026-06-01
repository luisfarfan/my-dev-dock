# homebrew-cask PR checklist (myDevDock)

Use this checklist before opening a PR to `Homebrew/homebrew-cask`.

## Artifact readiness

- [ ] macOS `.dmg` comes from GitHub Release tag `vX.Y.Z`
- [ ] Artifact is signed with `Developer ID Application`
- [ ] Artifact is notarized by Apple
- [ ] Ticket is stapled
- [ ] `codesign --verify --deep --strict` passes on clean machine
- [ ] `spctl -a -vvv -t exec` accepts the app

## Cask quality

- [ ] Cask token is correct (`mydevdock`)
- [ ] `version`, `sha256`, and `url` are reproducible
- [ ] `name`, `desc`, and `homepage` are accurate
- [ ] `depends_on macos` is realistic
- [ ] `zap` paths are correct and minimal
- [ ] No vendor-hosted URL restrictions violated

## Local checks

- [ ] `brew style Casks/mydevdock.rb`
- [ ] `brew audit --cask --strict Casks/mydevdock.rb`
- [ ] `brew install --cask ./Casks/mydevdock.rb` succeeds
- [ ] Fresh install launches app correctly

## PR notes

- [ ] Mention signing/notarization in PR description
- [ ] Include verification output snippets (`spctl`, `codesign`)
- [ ] Mention where artifacts are published (GitHub Releases)
