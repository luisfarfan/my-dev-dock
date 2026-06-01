cask "mydevdock" do
  version "1.0.0"
  sha256 "REPLACE_WITH_DMG_SHA256"

  url "https://github.com/luisfarfan/my-dev-dock/releases/download/v#{version}/myDevDock_#{version}_aarch64.dmg",
      verified: "github.com/luisfarfan/my-dev-dock/"
  name "myDevDock"
  desc "Desktop hub for local development projects"
  homepage "https://github.com/luisfarfan/my-dev-dock"

  auto_updates false
  depends_on macos: ">= :ventura"

  app "myDevDock.app"

  zap trash: [
    "~/Library/Application Support/com.dev-hub-tauri.app",
    "~/Library/Caches/com.dev-hub-tauri.app",
    "~/Library/Preferences/com.dev-hub-tauri.app.plist"
  ]
end
