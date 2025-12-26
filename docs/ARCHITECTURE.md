# LifeChronicle - Architektur-Dokumentation

## Überblick

LifeChronicle ist eine React-basierte Single-Page-Application (SPA), die es Benutzern ermöglicht, persönliche Lebensereignisse in einer chronologischen Timeline zu erfassen und durch KI-gestützte Textveredelung in literarische Texte zu verwandeln.

**Live:** https://www.dabrock.info/lifechronicle/

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React 18 + TypeScript                     │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  App.tsx (Main Component)                        │ │ │
│  │  │  - Timeline State Management                     │ │ │
│  │  │  - Entry CRUD Operations                         │ │ │
│  │  │  - LLM Provider Toggle (Ollama/GROK)            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  TimelineEntry.tsx                               │ │ │
│  │  │  - Individual Entry Display                      │ │ │
│  │  │  - Color Cycling (6 colors)                      │ │ │
│  │  │  - Process/Delete Actions                        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  LanguageContext (State)                         │ │ │
│  │  │  - Current Language (DE/EN/ES)                   │ │ │
│  │  │  - Translations from Backend                     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ HTTPS API Calls                  │
│                           ▼                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│            General Backend (Railway)                         │
│  URL: https://general-backend-production-a734...railway.app │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application                                   │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  /api/lifechonicle/entries                       │ │ │
│  │  │  - GET: List all entries                         │ │ │
│  │  │  - POST: Create new entry                        │ │ │
│  │  │  - DELETE: Remove entry                          │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  /api/lifechonicle/entries/{id}/process          │ │ │
│  │  │  - POST: LLM text refinement                     │ │ │
│  │  │  - Provider: ollama or grok                      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  /api/lifechonicle/export/pdf                    │ │ │
│  │  │  - GET: Generate colored PDF                     │ │ │
│  │  │  - 6-color timeline palette                      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  /api/translations                               │ │ │
│  │  │  - GET: ?app=lifechonicle&lang={de|en|es}       │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services Layer                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  lifechonicle_service.py                         │ │ │
│  │  │  - In-memory storage (MVP)                       │ │ │
│  │  │  - Demo data initialization                      │ │ │
│  │  │  - PDF generation with ReportLab                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  llm_gateway.py                                  │ │ │
│  │  │  - Ollama integration (qwen2.5:3b)               │ │ │
│  │  │  - GROK integration (grok-3)                     │ │ │
│  │  │  - Fallback mechanism                            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  translation_service.py                          │ │ │
│  │  │  - Multi-app support                             │ │ │
│  │  │  - Cached translations                           │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  External LLM Services                       │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  Ollama (Railway)    │    │  GROK API                │  │
│  │  - qwen2.5:3b        │    │  - grok-3 model          │  │
│  │  - DSGVO-konform     │    │  - Cloud-basiert         │  │
│  │  - Lokal auf Server  │    │  - API Key required      │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend-Architektur

### 1. Komponenten-Hierarchie

```
App.tsx (Root)
├── Header (Sticky)
│   ├── Title (H1)
│   └── Controls Container
│       ├── LanguageToggle
│       │   └── Language Buttons (DE/EN/ES)
│       └── LLM Toggle
│           └── Provider Buttons (Ollama/GROK)
├── Main Content
│   ├── Add Entry Button
│   ├── Add Entry Form (conditional)
│   │   ├── Title Input
│   │   ├── Date Input
│   │   ├── Text Textarea
│   │   └── Action Buttons (Save/Cancel)
│   ├── Timeline Section
│   │   └── TimelineEntry[] (map)
│   │       ├── Date Circle
│   │       ├── Entry Card
│   │       │   ├── Title
│   │       │   ├── Date
│   │       │   ├── Text (original or processed)
│   │       │   └── Actions
│   │       │       ├── Process Button (⏳ if processing, ✨ if pending)
│   │       │       └── Delete Button
│   │       └── Connector Line
│   └── "Weiterführend" Section (conditional)
│       ├── PDF Export Title
│       ├── Feature Cards (3)
│       └── PDF Download Button
└── Footer
    └── Powered by General Backend
```

### 2. State Management

**App.tsx State:**
```typescript
const [entries, setEntries] = useState<TimelineEntry[]>([])
const [llmType, setLlmType] = useState<'ollama' | 'grok'>('ollama')
const [showAddForm, setShowAddForm] = useState(false)
const [processingId, setProcessingId] = useState<string | null>(null)
const [newEntry, setNewEntry] = useState({ title: '', date: '', text: '' })
```

**LanguageContext State:**
```typescript
const [language, setLanguage] = useState<Language>('de')
const [translations, setTranslations] = useState<Record<string, string>>({})
const [loading, setLoading] = useState(true)
```

### 3. Data Flow

**Timeline Entry Lifecycle:**
```
1. User creates entry
   ├── Input: title, date, original_text
   ├── POST /api/lifechonicle/entries
   └── Response: entry with status="pending"

2. User clicks "Mit KI veredeln"
   ├── setProcessingId(entry.id)
   ├── POST /api/lifechonicle/entries/{id}/process?provider={ollama|grok}
   ├── Backend: LLM processes text (qwen2.5:3b or grok-3)
   ├── Response: entry with status="processed", processed_text
   └── setProcessingId(null)

3. User deletes entry
   ├── DELETE /api/lifechonicle/entries/{id}
   └── Remove from local state

4. User exports PDF
   ├── GET /api/lifechonicle/export/pdf
   ├── Backend: Generate PDF with ReportLab + Timeline colors
   └── Download PDF file
```

## Backend-Architektur

### 1. Service Layer (`lifechonicle_service.py`)

**In-Memory Storage (MVP):**
```python
class LifeChronicleService:
    def __init__(self):
        self.entries: Dict[str, Dict[str, Any]] = {}
        self._initialize_demo_data()
```

**Demo Data:**
- 8 vorausgefüllte Einträge (Geburt bis Neuer Job)
- 2 bereits verarbeitet (Geburt, Berufseinstieg)
- 6 pending (Erster Schultag, Abitur, Hochzeit, Beförderung, Vater, Neuer Job)

### 2. LLM Integration

**Provider Selection:**
```python
# Ollama (default, DSGVO-konform)
result = llm_gateway.generate(
    prompt=prompt,
    provider="ollama",
    model="qwen2.5:3b",
    temperature=0.7,
    max_tokens=300
)

# GROK (cloud-based, alternative)
result = llm_gateway.generate(
    prompt=prompt,
    provider="grok",
    model="grok-3",
    temperature=0.7,
    max_tokens=300
)
```

**LLM Prompt Template:**
```python
prompt = f"""Du bist ein professioneller Autobiografie-Autor.

Verwandle die folgende persönliche Erinnerung in ein literarisches Buchkapitel.
Schreibe in der Ich-Form, emotional und lebendig. Füge sensorische Details hinzu.
Länge: 3-5 Sätze.

Datum: {entry['date']}
Erinnerung: {entry['original_text']}

Buchkapitel:"""
```

### 3. PDF Generation (ReportLab)

**Timeline Color Palette:**
```python
TIMELINE_COLORS = [
    {'bg': '#e9d5ff', 'border': '#c084fc', 'text': '#581c87'},  # Purple
    {'bg': '#ccfbf1', 'border': '#5eead4', 'text': '#134e4a'},  # Teal
    {'bg': '#d1fae5', 'border': '#6ee7b7', 'text': '#065f46'},  # Green
    {'bg': '#fef3c7', 'border': '#fcd34d', 'text': '#78350f'},  # Yellow
    {'bg': '#fed7aa', 'border': '#fdba74', 'text': '#7c2d12'},  # Orange
    {'bg': '#fce7f3', 'border': '#f9a8d4', 'text': '#831843'},  # Pink
]
```

**PDF Structure:**
1. Title Page: "Meine Lebensgeschichte"
2. Subtitle: "Eine persönliche Chronik"
3. Entries (chronologisch, oldest first):
   - Colored Table per Entry
   - Title with colored background
   - Colored borders (3px left, 1px other sides)
   - Processed or original text
   - Automatic color cycling

**Table Styling:**
```python
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, 0), colors.HexColor(color_set['bg'])),
    ('LINEABOVE', (0, 0), (-1, 0), 3, colors.HexColor(color_set['border'])),
    ('LINEBELOW', (0, -1), (-1, -1), 1, colors.HexColor(color_set['border'])),
    ('LINEBEFORE', (0, 0), (0, -1), 3, colors.HexColor(color_set['border'])),
    ('LINEAFTER', (-1, 0), (-1, -1), 1, colors.HexColor(color_set['border'])),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
]))
```

## Design-System

### 1. Color Scheme

**Brand Colors:**
- Primary: Teal (`#14B8A6`) - Logo, Titel, CTA-Buttons
- Secondary: Emerald (`#10B981`) - Gradients, Accents

**Timeline Colors (6er-Palette):**
1. **Purple:** `bg-purple-100` / `border-purple-400` / `text-purple-800`
2. **Teal:** `bg-teal-100` / `border-teal-400` / `text-teal-800`
3. **Green:** `bg-green-100` / `border-green-400` / `text-green-800`
4. **Yellow:** `bg-yellow-100` / `border-yellow-400` / `text-yellow-800`
5. **Orange:** `bg-orange-100` / `border-orange-400` / `text-orange-800`
6. **Pink:** `bg-pink-100` / `border-pink-400` / `text-pink-800`

**Neutral Colors:**
- Background: `bg-gray-50`
- Cards: `bg-white`
- Borders: `border-gray-200`
- Text: `text-gray-800` / `text-gray-600`

### 2. Typography

**Font Stack:**
```css
font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
```

**Font Sizes:**
- H1 (Header): `text-3xl` (30px)
- Timeline Title: `text-4xl` (36px)
- Entry Title: `text-xl` (20px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)

### 3. Layout System

**Container Widths:**
- Max Width: `max-w-7xl` (1280px)
- Padding: `px-6` (24px horizontal)
- Vertical Spacing: `py-8` (32px vertical)

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 4. Component Patterns (CV_Matcher-Style)

**Sticky Header:**
```tsx
<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    {/* Title + Toggles */}
  </div>
</header>
```

**Toggle Containers:**
```tsx
<div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
  <button className="px-4 py-2 rounded-md font-medium transition-all">
    {/* Active: bg-white text-teal-600 shadow-sm */}
    {/* Inactive: text-gray-600 hover:text-gray-900 */}
  </button>
</div>
```

## Deployment-Architektur

### Frontend (Strato Hosting)

**Deployment-Flow:**
```
1. Local Development
   ├── npm run dev
   └── http://localhost:5173

2. Build
   ├── npm run build
   ├── Output: dist/
   │   ├── index.html
   │   ├── assets/
   │   │   ├── index-*.js (246 KB)
   │   │   └── index-*.css (4.6 KB)
   │   └── lc-icon.svg

3. SFTP Upload
   ├── Credentials: su403214 / deutz15!2000
   ├── Host: 5018735097.ssh.w2.strato.hosting
   ├── Target: /dabrock-info/lifechronicle/
   └── Files: index.html, assets/*, lc-icon.svg

4. Live
   └── https://www.dabrock.info/lifechronicle/
```

**Vite Configuration:**
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/lifechronicle/',  // Important for asset paths
})
```

### Backend (Railway)

**Auto-Deploy Flow:**
```
1. Git Push
   ├── git push origin main
   └── Triggers Railway webhook

2. Railway Build
   ├── Install dependencies (requirements.txt)
   ├── Start FastAPI server
   └── Health check: /health

3. Live
   └── https://general-backend-production-a734.up.railway.app
```

**Environment Variables (Railway):**
```env
DATABASE_URL=postgresql+asyncpg://...
OLLAMA_BASE_URL=http://ollama.railway.internal:11434
SECRET_KEY=<jwt-secret>
GROK_API_KEY=<grok-api-key>
ANTHROPIC_API_KEY=<optional>
ALLOWED_ORIGINS=https://www.dabrock.info
```

## Performance-Optimierungen

### Frontend

1. **Code Splitting:**
   - Vite automatisches Chunking
   - React.lazy für Komponenten (future)

2. **Asset Optimization:**
   - Minified JS: 246 KB → ~80 KB (gzip)
   - Minified CSS: 4.6 KB → ~1.3 KB (gzip)

3. **Caching:**
   - Translations gecached im LanguageContext
   - Browser-Cache für statische Assets

### Backend

1. **LLM Performance:**
   - Ollama (qwen2.5:3b): ~10-30 Sekunden (CPU)
   - GROK (grok-3): ~2-5 Sekunden (Cloud)
   - Timeout: 120 Sekunden

2. **PDF Generation:**
   - ReportLab: ~2-3 Sekunden (8 Einträge)
   - Streaming Response für große PDFs

3. **Translation Caching:**
   - In-memory Cache für Translations
   - Reduced API calls

## Sicherheit & Datenschutz

### DSGVO-Konformität

1. **Lokale LLM (Ollama):**
   - qwen2.5:3b läuft auf Railway (EU Region)
   - Keine Datenübertragung an externe APIs
   - Vollständige Datenkontrolle

2. **Alternative (GROK):**
   - Cloud-basiert (optional)
   - User kann wählen (Toggle)
   - Transparente Kennzeichnung

### Datenspeicherung

**MVP-Phase:**
- In-Memory Storage (keine Persistenz)
- Daten gehen bei Server-Restart verloren
- Demo-Daten werden neu initialisiert

**Future:**
- PostgreSQL Integration
- User-spezifische Timelines
- Authentifizierung mit fastapi-users

## Skalierbarkeit

### Aktuelle Limitationen

1. **In-Memory Storage:**
   - Maximal ~1000 Einträge pro Server
   - Keine Multi-User-Support
   - Kein Persistence

2. **Single Server:**
   - Railway Free Tier
   - Keine Load Balancing
   - Keine Redundanz

### Geplante Verbesserungen

1. **Database Integration:**
   - PostgreSQL für Persistence
   - User-Management
   - Multi-Tenancy

2. **Performance:**
   - Redis Caching
   - CDN für statische Assets
   - Database Connection Pooling

3. **Reliability:**
   - Railway Pro Tier (mehr Ressourcen)
   - GPU für Ollama (10x schneller)
   - Backup-Strategien

## Testing-Strategie

### Frontend Tests (geplant)

1. **Unit Tests:**
   - Component rendering
   - State management
   - API calls (mocked)

2. **Integration Tests:**
   - End-to-end user flows
   - API integration
   - Error handling

### Backend Tests (geplant)

1. **Unit Tests:**
   - Service layer
   - LLM gateway
   - PDF generation

2. **Integration Tests:**
   - API endpoints
   - Database operations
   - LLM providers

## Wartung & Monitoring

### Health Checks

**Backend:**
```bash
curl https://general-backend-production-a734.up.railway.app/health
# Expected: {"status": "healthy", "version": "1.0.0"}
```

**Frontend:**
```bash
curl https://www.dabrock.info/lifechronicle/
# Expected: 200 OK
```

### Logging

**Backend (Railway):**
- FastAPI Access Logs
- Error Logs
- LLM Request/Response Logs

**Frontend:**
- Browser Console Errors
- Network Errors (API calls)

## Anhang

### Technologie-Versionen

```json
{
  "frontend": {
    "react": "18.3.1",
    "typescript": "5.6.2",
    "vite": "7.3.0",
    "tailwindcss": "3.4.1"
  },
  "backend": {
    "python": "3.11+",
    "fastapi": "0.104.1",
    "reportlab": "4.0.7",
    "ollama": "0.1.0"
  }
}
```

### Nützliche Links

- **Live Demo:** https://www.dabrock.info/lifechronicle/
- **Backend Health:** https://general-backend-production-a734.up.railway.app/health
- **API Docs:** https://general-backend-production-a734.up.railway.app/docs
- **GitHub (Frontend):** https://github.com/md20210/LifeChronicle
- **GitHub (Backend):** https://github.com/md20210/general-backend

---

**Letzte Aktualisierung:** 2024-12-25
**Version:** 1.0.1
**Autor:** Michael Dabrock
