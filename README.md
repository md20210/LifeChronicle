# LifeChronicle

**Eine persönliche Timeline-App mit KI-gestützter Textveredelung**

LifeChronicle ist eine React-basierte Webanwendung, die es Nutzern ermöglicht, wichtige Lebensereignisse in einer chronologischen Timeline festzuhalten und durch KI in literarische Texte zu verwandeln.

🌐 **Live Demo:** https://www.dabrock.info/lifechronicle/

## Features

### 📅 Timeline-Management
- Chronologische Darstellung von Lebensereignissen
- Farbcodierte Einträge (6 verschiedene Farben)
- Datum, Titel und Beschreibung für jedes Ereignis
- Visuell ansprechende Timeline mit Verbindungslinien und Punkten

### 🤖 KI-Textveredelung
- **Zwei LLM-Optionen:**
  - **Ollama (Lokal):** DSGVO-konform, läuft auf eigenem Server (qwen2.5:3b)
  - **GROK:** Cloud-basiert, leistungsstarke Alternative
- Verwandlung von Stichpunkten in literarische Buchkapitel
- Emotionale und lebendige Ich-Form-Erzählung
- Automatische sensorische Details und Beschreibungen

### 📖 PDF-Export
- Professionell formatiertes PDF-Buch
- Farbige Timeline-Darstellung im PDF
- Verwendung von veredelten oder Original-Texten
- Automatisches Inhaltsverzeichnis
- 6 Timeline-Farben (Purple, Teal, Green, Yellow, Orange, Pink)

### 🌍 Mehrsprachigkeit
- Deutsch (DE) 🇩🇪
- English (EN) 🇺🇸
- Español (ES) 🇪🇸
- Live-Sprachwechsel ohne Neuladen

## Technologie-Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build-Tool
- **TailwindCSS** - Styling
- **Responsive Design** - Mobile & Desktop optimiert

### Backend Integration
- **General Backend** (FastAPI + Railway)
- **LLM Gateway** für Ollama & GROK
- **Translation Service** für mehrsprachige UI
- **PDF Generation** mit ReportLab

### Deployment
- **Frontend:** Strato Hosting (SFTP)
- **Backend:** Railway (Auto-Deploy via GitHub)
- **Basis-URL:** `/lifechronicle/` (vite.config.ts)

## UI-Design

### Header (CV_Matcher-Style)
```tsx
// Sticky Header am Top der Seite
<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <h1 className="text-3xl font-bold text-teal-600">LifeChronicle</h1>

    <div className="flex items-center gap-4">
      {/* Language Toggle */}
      <LanguageToggle />

      {/* LLM Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {/* Ollama / GROK Toggle Buttons */}
      </div>
    </div>
  </div>
</header>
```

### Toggle Buttons (1:1 Kopie von CV_Matcher)
```tsx
// Container
<div className="flex gap-2 bg-gray-100 p-1 rounded-lg">

// Buttons
<button className="px-4 py-2 rounded-md font-medium transition-all">
  // Active: bg-white text-teal-600 shadow-sm
  // Inactive: text-gray-600 hover:text-gray-900
</button>
```

### Timeline-Farben
```typescript
const TIMELINE_COLORS = [
  { bgColor: 'bg-purple-100', borderColor: 'border-purple-400', ... },  // Purple
  { bgColor: 'bg-teal-100', borderColor: 'border-teal-400', ... },      // Teal
  { bgColor: 'bg-green-100', borderColor: 'border-green-400', ... },    // Green
  { bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400', ... },  // Yellow
  { bgColor: 'bg-orange-100', borderColor: 'border-orange-400', ... },  // Orange
  { bgColor: 'bg-pink-100', borderColor: 'border-pink-400', ... },      // Pink
];
```

## Entwicklung

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
# Output: dist/
```

### Deployment (Strato)
```bash
# Automatisches Deployment-Script
SFTP_USER="su403214"
SFTP_PASS='deutz15!2000'
SFTP_HOST="5018735097.ssh.w2.strato.hosting"

# Upload index.html
curl -T dist/index.html --user "$SFTP_USER:$SFTP_PASS" \
  "sftp://$SFTP_HOST/dabrock-info/lifechronicle/" -k

# Upload assets
curl -T dist/assets/* --user "$SFTP_USER:$SFTP_PASS" \
  "sftp://$SFTP_HOST/dabrock-info/lifechronicle/assets/" -k
```

## Projekt-Struktur
```
LifeChronicle/
├── src/
│   ├── App.tsx                      # Haupt-Komponente mit Timeline-Logik
│   ├── components/
│   │   ├── TimelineEntry.tsx        # Einzelner Timeline-Eintrag
│   │   └── LanguageToggle.tsx       # Sprachauswahl-Komponente
│   ├── contexts/
│   │   └── LanguageContext.tsx      # Mehrsprachigkeits-Context
│   └── services/
│       └── api.ts                   # Backend API-Calls
├── dist/                            # Build-Output (deployment-ready)
├── vite.config.ts                   # Vite-Konfiguration (base: '/lifechronicle/')
└── README.md                        # Diese Datei
```

## Änderungsprotokoll

### 2024-12-25: CV_Matcher Layout-Übernahme

**Problem:**
- Header-Struktur unterschied sich komplett von CV_Matcher
- Toggle-Buttons hatten nicht das gleiche Styling
- Abstände und Margins waren inkonsistent

**Lösung:**
1. **Header komplett umgebaut:**
   - Von: `bg-white rounded-xl shadow-md p-6 mb-8` (floating box)
   - Zu: `bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50` (sticky top)
   - Entfernt: SVG Logo, Subtitle
   - Vereinfacht: Nur H1 Titel + Toggles

2. **Main Content Wrapper hinzugefügt:**
   - `<main className="max-w-7xl mx-auto px-6 py-8">`
   - Gleiche max-width wie CV_Matcher (7xl statt 6xl)
   - Konsistente Abstände: px-6 py-8

3. **Toggle Buttons 1:1 Kopie:**
   - Container: `flex gap-2 bg-gray-100 p-1 rounded-lg`
   - Buttons: `px-4 py-2 rounded-md font-medium transition-all`
   - Keine zusätzlichen Borders oder Shadows

**Commit:** `6015f4a` - "COMPLETE 1:1 copy of CV_Matcher header and layout structure"

### 2024-12-25: PDF-Export mit Timeline-Farben

**Problem:**
- PDF-Export hatte keine Farben (nur schwarzer Text)
- User beschwerte sich: "Der Pdf download enthaelt keine Farben!"

**Lösung:**
- Implementierung von `TIMELINE_COLORS` im Backend
- ReportLab Table mit farbigen Borders und Backgrounds
- 6 Farben-Palette (Purple, Teal, Green, Yellow, Orange, Pink)
- Cycling durch Farben basierend auf Entry-Index

**Backend-Datei:** `lifechonicle_service.py:217-313`

**Commit:** "Add timeline colors to PDF export"

### 2024-12-25: Processing-Indikator

**Problem:**
- Keine visuelle Rückmeldung während LLM-Verarbeitung
- User wusste nicht, ob etwas passiert

**Lösung:**
- Spinner-Animation: `⏳` (rotating hourglass)
- State: `processingId` in App.tsx
- Disabled-State während Verarbeitung
- Translation: `lifechonicle_action_processing`

**Commit:** "Add processing indicator translation for LifeChronicle"

### 2024-12-25: "Weiterführend" Sektion

**Problem:**
- PDF-Button im Header unpassend platziert
- Keine visuelle Hervorhebung der Export-Funktion

**Lösung:**
- Neue Sektion am Ende der Timeline
- Gradient-Background (teal-50 to emerald-50)
- 3 Feature-Cards (Farbige Timeline, LLM-Texte, Layout)
- Großer CTA-Button mit Kapitel-Zähler
- Titel: "Weiterführend" statt "Deine Lebensgeschichte als Buch"

**Commit:** "Add VoiceBot phone number and language cards" (enthielt auch andere Änderungen)

## Backend-Abhängigkeiten

### General Backend Endpoints

**Translations:**
```
GET https://general-backend-production-a734.up.railway.app/api/translations?app=lifechonicle&lang={de|en|es}
```

**Timeline Operations:**
```
GET    /api/lifechonicle/entries          # Alle Einträge abrufen
POST   /api/lifechonicle/entries          # Neuen Eintrag erstellen
DELETE /api/lifechonicle/entries/{id}     # Eintrag löschen
POST   /api/lifechonicle/entries/{id}/process  # LLM-Verarbeitung
GET    /api/lifechonicle/export/pdf       # PDF-Export
```

**LLM Processing:**
- Provider: `ollama` (default) oder `grok`
- Modell: `qwen2.5:3b` (Ollama) oder `grok-3` (GROK)
- Temperature: 0.7
- Max Tokens: 300

## Translation Keys (lifechonicle.py)

```python
"lifechonicle_app_title": "LifeChronicle"
"lifechonicle_app_subtitle": "Deine Lebensgeschichte als Timeline"
"lifechonicle_btn_new_entry": "Neuer Eintrag"
"lifechonicle_btn_export_pdf": "PDF-Buch herunterladen"
"lifechonicle_llm_toggle_local": "Lokal (Ollama)"
"lifechonicle_llm_toggle_grok": "GROK"
"lifechonicle_action_process": "Mit KI veredeln"
"lifechonicle_action_processing": "Wird verarbeitet..."
"lifechonicle_action_delete": "Löschen"
# ... (insgesamt 20+ Keys)
```

## Browser-Kompatibilität
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile Browsers: ✅

## Lizenz
Proprietary - dabrock.info

## Autor
Michael Dabrock
https://www.dabrock.info

---

**Build:** 246.21 KB JS, 4.61 KB CSS
**Deployed:** https://www.dabrock.info/lifechronicle/
