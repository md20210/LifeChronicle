# LifeChronicle - API Dokumentation

## Basis-URL

```
https://general-backend-production-a734.up.railway.app
```

## Authentifizierung

**MVP-Phase:** Keine Authentifizierung erforderlich
**Future:** JWT-basierte Authentifizierung mit fastapi-users

## Endpoints

### 1. Übersetzungen abrufen

**GET** `/api/translations`

Ruft UI-Übersetzungen für die angegebene Sprache ab.

**Query Parameters:**
- `app` (required): `lifechonicle`
- `lang` (required): `de` | `en` | `es`

**Request:**
```bash
curl "https://general-backend-production-a734.up.railway.app/api/translations?app=lifechonicle&lang=de"
```

**Response:** `200 OK`
```json
{
  "lifechonicle_app_title": "LifeChronicle",
  "lifechonicle_app_subtitle": "Deine Lebensgeschichte als Timeline",
  "lifechonicle_loading": "Laden...",
  "lifechonicle_llm_toggle_local": "Lokal (Ollama)",
  "lifechonicle_llm_toggle_grok": "GROK",
  "lifechonicle_btn_new_entry": "Neuer Eintrag",
  "lifechonicle_btn_export_pdf": "PDF-Buch herunterladen",
  "lifechonicle_timeline_title": "Deine Lebensgeschichte",
  "lifechonicle_timeline_empty": "Noch keine Einträge. Erstelle deinen ersten Eintrag!",
  "lifechonicle_form_title": "Neuer Eintrag",
  "lifechonicle_form_label_title": "Titel",
  "lifechonicle_form_label_date": "Datum",
  "lifechonicle_form_label_text": "Beschreibung",
  "lifechonicle_form_placeholder_title": "z.B. Erster Schultag",
  "lifechonicle_form_placeholder_text": "Beschreibe das Ereignis...",
  "lifechonicle_btn_save": "Speichern",
  "lifechonicle_btn_cancel": "Abbrechen",
  "lifechonicle_action_process": "Mit KI veredeln",
  "lifechonicle_action_processing": "Wird verarbeitet...",
  "lifechonicle_action_delete": "Löschen",
  "lifechonicle_status_pending": "Noch nicht verarbeitet",
  "lifechonicle_status_processed": "Verarbeitet",
  "lifechonicle_footer_powered_by": "Powered by",
  "lifechonicle_footer_local_gdpr": "Lokal & DSGVO-konform"
}
```

---

### 2. Alle Timeline-Einträge abrufen

**GET** `/api/lifechonicle/entries`

Ruft alle Timeline-Einträge ab, sortiert nach Datum (neueste zuerst).

**Request:**
```bash
curl "https://general-backend-production-a734.up.railway.app/api/lifechonicle/entries"
```

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Neuer Job",
    "date": "2023-11-01",
    "original_text": "Neuer Job bei IBM als Principal AI Consultant. Spannende Herausforderungen warten!",
    "processed_text": null,
    "status": "pending",
    "created_at": "2024-12-25T10:30:00"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Geburt",
    "date": "1985-06-15",
    "original_text": "Ich wurde in München geboren. Ein sonniger Sommertag, wie mir meine Mutter später erzählte.",
    "processed_text": "An einem strahlenden Junitag des Jahres 1985 erblickte ich in der bayerischen Hauptstadt München das Licht der Welt...",
    "status": "processed",
    "created_at": "2024-12-25T10:30:00"
  }
]
```

**Status Codes:**
- `200 OK` - Erfolgreich abgerufen
- `500 Internal Server Error` - Server-Fehler

---

### 3. Timeline-Eintrag erstellen

**POST** `/api/lifechonicle/entries`

Erstellt einen neuen Timeline-Eintrag mit Status "pending".

**Request Body:**
```json
{
  "title": "Hochzeit",
  "date": "2010-07-15",
  "original_text": "Hochzeit mit meiner Frau Sarah. Der schönste Tag meines Lebens!"
}
```

**Request:**
```bash
curl -X POST "https://general-backend-production-a734.up.railway.app/api/lifechonicle/entries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hochzeit",
    "date": "2010-07-15",
    "original_text": "Hochzeit mit meiner Frau Sarah. Der schönste Tag meines Lebens!"
  }'
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Hochzeit",
  "date": "2010-07-15",
  "original_text": "Hochzeit mit meiner Frau Sarah. Der schönste Tag meines Lebens!",
  "processed_text": null,
  "status": "pending",
  "created_at": "2024-12-25T12:45:00"
}
```

**Validation:**
- `title`: String, required, nicht leer
- `date`: String, required, ISO 8601 Format (YYYY-MM-DD)
- `original_text`: String, required, nicht leer

**Status Codes:**
- `200 OK` - Erfolgreich erstellt
- `422 Unprocessable Entity` - Validierungsfehler
- `500 Internal Server Error` - Server-Fehler

**Error Response:**
```json
{
  "detail": "Title, date and text are required"
}
```

---

### 4. Timeline-Eintrag löschen

**DELETE** `/api/lifechonicle/entries/{id}`

Löscht einen Timeline-Eintrag anhand seiner ID.

**Path Parameters:**
- `id` (required): UUID des Eintrags

**Request:**
```bash
curl -X DELETE "https://general-backend-production-a734.up.railway.app/api/lifechonicle/entries/550e8400-e29b-41d4-a716-446655440002"
```

**Response:** `200 OK`
```json
{
  "message": "Entry deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Erfolgreich gelöscht
- `404 Not Found` - Eintrag nicht gefunden
- `500 Internal Server Error` - Server-Fehler

**Error Response:**
```json
{
  "detail": "Entry not found"
}
```

---

### 5. Eintrag mit LLM verarbeiten

**POST** `/api/lifechonicle/entries/{id}/process`

Verarbeitet einen Timeline-Eintrag mit einem LLM (Ollama oder GROK) und verwandelt den Originaltext in literarischen Prosa-Text.

**Path Parameters:**
- `id` (required): UUID des Eintrags

**Query Parameters:**
- `provider` (optional): `ollama` (default) | `grok` | `anthropic`

**Request:**
```bash
# Mit Ollama (Standard, DSGVO-konform)
curl -X POST "https://general-backend-production-a734.up.railway.app/api/lifechonicle/entries/550e8400-e29b-41d4-a716-446655440000/process?provider=ollama"

# Mit GROK (Cloud-basiert)
curl -X POST "https://general-backend-production-a734.up.railway.app/api/lifechonicle/entries/550e8400-e29b-41d4-a716-446655440000/process?provider=grok"
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Neuer Job",
  "date": "2023-11-01",
  "original_text": "Neuer Job bei IBM als Principal AI Consultant. Spannende Herausforderungen warten!",
  "processed_text": "Mit einem Gefühl der Aufregung und Erwartung betrat ich am 1. November 2023 zum ersten Mal die Büroräume von IBM. Als frischgebackener Principal AI Consultant begann hier ein neues Kapitel meiner professionellen Karriere. Die imposanten Gebäude, die innovativen Technologien und die spannenden Herausforderungen – alles fühlte sich gleichzeitig aufregend und vielversprechend an.",
  "status": "processed",
  "created_at": "2024-12-25T10:30:00"
}
```

**LLM-Provider Details:**

**Ollama (qwen2.5:3b):**
- Lokal auf Railway-Server
- DSGVO-konform (keine Datenübertragung)
- CPU-basiert (~10-30 Sekunden)
- Kostenlos
- Prompt-Template: Autobiografie-Autor, 3-5 Sätze, emotionale Ich-Form

**GROK (grok-3):**
- Cloud-basiert (xAI API)
- Schneller (~2-5 Sekunden)
- API Key erforderlich
- Kostenpflichtig

**Status Codes:**
- `200 OK` - Erfolgreich verarbeitet
- `404 Not Found` - Eintrag nicht gefunden
- `500 Internal Server Error` - LLM-Fehler oder Server-Fehler
- `504 Gateway Timeout` - LLM-Timeout (>120 Sekunden)

**Error Response:**
```json
{
  "detail": "LLM processing error: Model not available"
}
```

---

### 6. PDF-Export

**GET** `/api/lifechonicle/export/pdf`

Generiert ein PDF-Buch mit allen Timeline-Einträgen, sortiert chronologisch (älteste zuerst).

**Features:**
- Farbige Timeline (6-Farben-Palette)
- Title Page: "Meine Lebensgeschichte"
- Subtitle: "Eine persönliche Chronik"
- Colored Tables per Entry
- Processed oder Original-Text
- A4 Format (Portrait)

**Request:**
```bash
curl "https://general-backend-production-a734.up.railway.app/api/lifechonicle/export/pdf" \
  --output meine_lebensgeschichte.pdf
```

**Response:** `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="meine_lebensgeschichte.pdf"

[PDF Binary Data]
```

**PDF-Struktur:**
1. **Title Page:**
   - Title: "Meine Lebensgeschichte" (Teal)
   - Subtitle: "Eine persönliche Chronik"

2. **Entries (Chronologisch):**
   - Entry 1: Purple background, purple borders
   - Entry 2: Teal background, teal borders
   - Entry 3: Green background, green borders
   - Entry 4: Yellow background, yellow borders
   - Entry 5: Orange background, orange borders
   - Entry 6: Pink background, pink borders
   - Entry 7: Purple (cycling back)
   - ...

3. **Entry Format:**
   ```
   ┌─────────────────────────────────────┐
   │ Titel (Datum)                       │  ← Colored Background
   ├─────────────────────────────────────┤
   │ Processed oder Original Text        │
   │                                     │
   │ Lorem ipsum dolor sit amet...       │
   └─────────────────────────────────────┘
      ↑ 3px colored border (left)
   ```

**Status Codes:**
- `200 OK` - PDF erfolgreich generiert
- `500 Internal Server Error` - PDF-Generierungsfehler

**Performance:**
- Generierungszeit: ~2-3 Sekunden (8 Einträge)
- Dateigröße: ~50-200 KB

---

## Data Models

### TimelineEntry

```typescript
interface TimelineEntry {
  id: string;                      // UUID
  title: string;                   // Entry title (e.g., "Geburt", "Hochzeit")
  date: string;                    // ISO 8601 date (YYYY-MM-DD)
  original_text: string;           // Original user input
  processed_text: string | null;   // LLM-generated literary text
  status: 'pending' | 'processed'; // Processing status
  created_at: string;              // ISO 8601 timestamp
}
```

### LLM Prompt Template

```python
prompt = f"""Du bist ein professioneller Autobiografie-Autor.

Verwandle die folgende persönliche Erinnerung in ein literarisches Buchkapitel.
Schreibe in der Ich-Form, emotional und lebendig. Füge sensorische Details hinzu.
Länge: 3-5 Sätze.

Datum: {entry['date']}
Erinnerung: {entry['original_text']}

Buchkapitel:"""
```

### Timeline Colors (Frontend)

```typescript
const TIMELINE_COLORS = [
  {
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-800',
    dotColor: 'bg-purple-600'
  },
  {
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-800',
    dotColor: 'bg-teal-600'
  },
  {
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    textColor: 'text-green-800',
    dotColor: 'bg-green-600'
  },
  {
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-600'
  },
  {
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-600'
  },
  {
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-800',
    dotColor: 'bg-pink-600'
  }
];
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Invalid request parameters"
}
```

**404 Not Found:**
```json
{
  "detail": "Entry not found"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

**504 Gateway Timeout:**
```json
{
  "detail": "LLM request timeout after 120 seconds"
}
```

## Rate Limiting

**MVP-Phase:** Keine Rate Limits
**Future:**
- 100 Requests pro Minute pro IP
- 10 LLM-Requests pro Stunde pro User

## CORS

**Allowed Origins:**
```
https://www.dabrock.info
http://localhost:5173 (Development)
```

## Health Check

**GET** `/health`

```bash
curl "https://general-backend-production-a734.up.railway.app/health"
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-12-25T12:00:00"
}
```

## API-Changelog

### Version 1.0.1 (2024-12-25)
- ✅ PDF-Export jetzt mit Timeline-Farben
- ✅ Neue Translation: `lifechonicle_action_processing`
- ✅ ReportLab Table-Styling implementiert

### Version 1.0.0 (2024-12-21)
- ✅ Initial API Release
- ✅ CRUD Operations für Timeline-Einträge
- ✅ LLM-Integration (Ollama + GROK)
- ✅ PDF-Export (schwarz-weiß)
- ✅ Translation Service

---

**Letzte Aktualisierung:** 2024-12-25
**API Version:** 1.0.1
**Maintainer:** Michael Dabrock
