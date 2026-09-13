# Pocket CRM – Regeln für alle (Menschen und KI-Agenten)

Diese Datei gilt für Codex, Claude Code und jeden anderen Agenten. `CLAUDE.md` verweist hierher.

## Was wir bauen

- **Pocket CRM ist eine React-Native-App** (Expo, Ordner `pocket-crm-native/`).
- Wir bauen **keine Web-App** und **keine iOS-/Android-spezifischen Versionen**. Die App bleibt plattformneutral.
- `pocket-crm/` ist der ursprüngliche Web-Export aus Google AI Studio. Er dient nur als **Referenz** für Inhalte, Daten und Abläufe. Dort wird nicht weiterentwickelt.
- Xcode / iPhone-Simulator wird nur genutzt, um die **Demo aufzunehmen**.

## Branches

| Branch | Rolle |
|---|---|
| `base` | Eingefrorene Basis der App. Wird nicht mehr verändert. |
| `main` | Aktueller Arbeitsstand. Nur über Pull Requests. |
| `<name>/<aufgabe>` | Kurze Arbeits-Branches, z. B. `codex/kontakte-sortierung`. Von `main` abzweigen. |

Ablauf: `git pull` auf `main` → neuen Branch → arbeiten → Pull Request nach `main` → mergen.
Gemergte Branches werden automatisch gelöscht (GitHub-Einstellung). Lokal danach `git branch -d <branch>`.

### Aufbauende Branches („stacked“)

Baut ein Feature auf einem Branch auf, der noch nicht in `main` ist, dann:
- vom **Feature-Branch** abzweigen, nicht von `main`
- PR **auf diesen Feature-Branch** stellen, nicht auf `main`
- regelmäßig den Basis-Branch hereinholen: `git merge <basis-branch>`
- nur eigene Dateien anfassen; gemeinsame Dateien nur minimal (siehe unten)

## Laufende Arbeit

| Branch | Basis | PR-Ziel | Inhalt |
|---|---|---|---|
| `speak-to-ai` | `main` | `main` | Spracheingabe: Gesprächsnotiz einsprechen → Kontaktfelder vorbefüllen |
| `franzi/contacts-rework` | `main` | `main` | Umbau der Kontakte-Seite |
| `adding-features` | `speak-to-ai` | `speak-to-ai` | Assistent: echte KI, Websuche, bestätigte Änderungen |

**Speak to AI – wo der Code hingehört**
- Neu: `src/components/SpeakToAIModal.tsx` (Dialog mit Aufnahme, Live-Text, Weiter-Button)
- Neu: `src/speech.ts` (Spracherkennung, Web Speech API im Browser) und die Feldzuordnung in `src/ai.ts`: `extractContactWithAI(text, events)` schickt das Transkript per Gemini-Proxy an das Modell (JSON-Schema, jede Sprache, matcht bekannte Events); `extractContact` ist nur noch der regelbasierte Fallback ohne Netz
- `src/store.tsx`: nur `isSpeakOpen` / `setSpeakOpen` ergänzen (wie `isScanOpen`)
- `src/components/Modals.tsx`: nur die eine Zeile `<SpeakToAIModal />`
- `src/components/AddContactCard.tsx`: nur den `onPress` des Buttons auf `setSpeakOpen(true)` umstellen
- Am Ende wird der Kontakt-Dialog vorbefüllt geöffnet: `openAddContact({ name, role, company, howWeMet, notes })` – genau wie beim QR-Scan in `ScanLinkedInModal.tsx`
- Natives Modul für Sprache (z. B. `expo-speech-recognition`) nur mit `npx expo install`; danach braucht der iOS-Simulator einen Neubau (`npx expo prebuild -p ios --clean`, `pod install`), siehe README

**Assistent – wo der Code hingehört**
- `src/gemini.ts`: reiner Transport, ruft aber nicht Gemini direkt – sondern unsere eigene Netlify Function `netlify/functions/gemini.mts`, die den echten Key serverseitig anhängt (`GEMINI_API_KEY`, ohne `EXPO_PUBLIC_`-Prefix, im Netlify-Dashboard gesetzt). So landet der Key nie im ausgelieferten Bundle. Function Calling und Websuche gehen nie im selben Request – das ist eine API-Vorgabe, nicht unsere Wahl.
- `src/assistant.ts`: Werkzeuge und Schleife. Lesende Werkzeuge laufen automatisch, schreibende geben eine `AssistantAction` zurück und beenden den Zug.
- Der Assistent schreibt nie selbst in den Store. `AIChatView` zeigt eine Karte, erst „Save“ ruft `saveContact` / `addTask` / `toggleTask`.
- Löschen ist absichtlich kein Werkzeug.
- Ob es echte Antworten statt Demo-Modus gibt, hängt am Server (ist `GEMINI_API_KEY` bei Netlify gesetzt?), nicht mehr an einer Client-Umgebungsvariable. Beide Wege müssen funktionieren.

## Regeln für Änderungen

- **Nicht großflächig neu schreiben.** Bestehende Bildschirme und Komponenten anpassen, nicht ersetzen. Wenn ein Umbau nötig scheint, erst im PR beschreiben.
- **Nur `expo-router`-Navigation** verwenden (`Stack`, `Tabs` aus `expo-router`). Kein `@react-navigation/*` direkt importieren – Expo SDK 57 blockiert das.
- **Pakete nur mit `npx expo install <paket>`** hinzufügen, damit die Version zur Expo-SDK passt. Niemals `npm install` für React-Native-Pakete.
- **Daten und Typen** liegen in `pocket-crm-native/types.ts`, `mockData.ts`, `crmHelpers.ts`. Der gemeinsame Zustand liegt in `src/store.tsx`.
- **Keine API-Keys committen.** Keys gehören in `.env` (steht in `.gitignore`).
- **Keine generierten Ordner committen** (`ios/`, `android/`, `node_modules/`, `.expo/`).
- Vor dem PR: `npx tsc --noEmit` in `pocket-crm-native/` muss ohne Fehler durchlaufen.

## App starten

Siehe `README.md`.

## Bekannte Stolperfallen

- **Projektpfad ohne Leerzeichen** und **nicht in iCloud/OneDrive-Ordnern** (Desktop, Dokumente). Sonst scheitern native Builds.
- **Windows:** einmalig `git config --global core.longpaths true` setzen.
- Expo-Doku für diese SDK-Version: https://docs.expo.dev/versions/v57.0.0/
