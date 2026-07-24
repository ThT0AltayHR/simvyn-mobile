# Simvyn Mobile

Universal mobile devtool — control iOS Simulators, Android Emulators, and real devices from a single mobile dashboard.

A React Native (Expo) port of [Simvyn](https://github.com/pranshuchittora/simvyn).

> **Developer:** AltayHR Developer  
> **Website:** [turkhackteam.org](https://turkhackteam.org)

---

## Download APK

Check the [Releases](../../releases) page for the latest APK build.

## How It Works

This app connects to a running Simvyn server on your local network.

1. Install [Simvyn](https://github.com/pranshuchittora/simvyn): `npx simvyn`
2. Note the server URL (default: `http://<your-ip>:3001`)
3. Open Simvyn Mobile on your Android device
4. Enter the server URL on the connect screen
5. Control all your simulators and emulators from your phone

## Features

- **Device Management** — Boot, shutdown, erase, clone simulators and emulators
- **App Management** — Install, launch, terminate, uninstall apps
- **Log Viewer** — Real-time log streaming with level filtering and regex search
- **Location Simulation** — Set GPS coordinates, quick city presets
- **Screenshot & Recording** — Capture screenshots and screen recordings
- **Deep Links** — Open URLs and custom URI schemes
- **Push Notifications** — Send APNs payloads to iOS simulators
- **File Browser** — Navigate app sandbox file system
- **Database Inspector** — Browse SQLite tables, run SQL queries
- **Device Settings** — Dark mode, locale, orientation, accessibility
- **Crash Logs** — View iOS and Android crash reports
- **Media** — Push photos/videos to device galleries
- **Clipboard** — Read and write device clipboard
- **Collections** — Bundle actions into reusable sequences
- **Landscape Mode** — Optimized for landscape orientation

## Build from Source

```bash
git clone https://github.com/YOUR_USERNAME/simvyn-mobile
cd simvyn-mobile
npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## Requirements

- Android 7.0+ (API 24+)
- A running Simvyn server on the same network (`npx simvyn`)

## License

MIT
