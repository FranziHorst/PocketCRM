# PocketCRM

A Pocket CRM to never forget details about your contacts.

Die App ist eine **React-Native-App** (Expo). Sie liegt in `pocket-crm-native/`.
`pocket-crm/` ist der ursprüngliche Web-Export und dient nur als Referenz.

Regeln für Zusammenarbeit und KI-Agenten: siehe [`AGENTS.md`](AGENTS.md).

## Voraussetzungen

- **Node.js 24** (Version steht in `.nvmrc`)
- **Git**
- Windows zusätzlich einmalig: `git config --global core.longpaths true`

Das Projekt in einen Pfad **ohne Leerzeichen** und **außerhalb von iCloud/OneDrive** klonen,
z. B. `~/Developer/PocketCRM` (Mac) oder `C:\dev\PocketCRM` (Windows).

## App starten (Mac und Windows)

```bash
cd pocket-crm-native
npm install
npx expo start --web
```

Die App öffnet sich im Browser. Das ist die React-Native-App, nur im Browser dargestellt.
Dafür ist weder Xcode noch Android Studio nötig.

## iPhone-Simulator (nur Mac, nur für die Demo-Aufnahme)

Einmalig: Xcode aus dem App Store installieren, dann:

```bash
sudo xcodebuild -license accept
brew install cocoapods
cd pocket-crm-native
npx expo prebuild -p ios
cd ios && pod install
```

Danach in Xcode `pocket-crm-native/ios/PocketCRMNative.xcworkspace` öffnen, einen iPhone-Simulator wählen und ▶ Run drücken.
Parallel muss `npx expo start` im Ordner `pocket-crm-native` laufen.

## Branches

- `base` – eingefrorene Basis der App
- `main` – aktueller Arbeitsstand, nur über Pull Requests
- `<name>/<aufgabe>` – eigene Arbeits-Branches, von `main` abgezweigt
