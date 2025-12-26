# LifeChronicle Sprint Backlog

## 🚧 Offene Probleme (für spätere Sprints)

---

## Sprint 2: Layout & UX Improvements

### 🖼️ Problem 1: Fotos werden in Timeline nicht angezeigt

**Status**: 🔴 OFFEN (verschoben auf Sprint 2)

**Symptome**:
- Fotos sind im Backend gespeichert ✅
- `photo_urls` sind in DB vorhanden ✅
- Backend liefert Fotos aus unter `/uploads/...` ✅
- **ABER**: Fotos erscheinen nicht in der Timeline im Frontend ❌

**Diagnose**:
```bash
# Backend: Fotos SIND gespeichert
curl "https://general-backend-production-a734.up.railway.app/lifechronicle/entries" \
  -H "Authorization: Bearer TOKEN" | jq '.entries[].photo_urls'

# Output: ["/uploads/lifechronicle/xxx.jpg"]
```

**Mögliche Ursachen**:
1. Browser-Cache lädt alte JS-Datei (ohne Foto-Code)
2. Frontend-Code für Foto-Anzeige nicht korrekt deployed
3. CORS-Problem beim Laden der Bilder
4. CSS-Klassen fehlen / werden überschrieben

**Code-Referenz**:
- Frontend: `src/components/TimelineEntry.tsx:96-109`
- Backend: `backend/api/lifechronicle.py:155-159`

**Zu prüfen in Sprint 2**:
- [ ] Hard-Refresh in ALLEN Browsern (Chrome, Firefox, Safari)
- [ ] Inkognito-Modus testen
- [ ] Browser DevTools → Network → Prüfe ob Bilder geladen werden
- [ ] Browser DevTools → Console → Errors?
- [ ] `photo_urls` korrekt konstruiert? (Full URL vs. relative path)

**Erwartetes Verhalten**:
```jsx
// TimelineEntry.tsx sollte zeigen:
{entry.photo_urls && entry.photo_urls.length > 0 && (
  <div className="mt-4 grid grid-cols-2 gap-2">
    {entry.photo_urls.map((url, index) => (
      <img
        src={`https://general-backend-production-a734.up.railway.app${url}`}
        alt={`Photo ${index + 1}`}
        className="w-full h-48 object-cover rounded-lg"
      />
    ))}
  </div>
)}
```

---

### 📄 Problem 2: PDF-Export ohne Fotos

**Status**: 🔴 OFFEN (verschoben auf Sprint 2)

**Symptome**:
- PDF-Export funktioniert ✅
- Farbige Timeline-Kapitel erscheinen ✅
- Text wird korrekt exportiert ✅
- **ABER**: Fotos fehlen im PDF ❌

**Aktuelle Implementierung**:
```python
# backend/api/lifechronicle.py:317-350
for idx, entry in enumerate(entries):
    # Title + Text werden exportiert
    # photo_urls werden NICHT verwendet
```

**Zu implementieren in Sprint 2**:
```python
# Für jedes Entry mit Fotos:
for photo_url in entry.photo_urls:
    # 1. Lade Foto vom Volume
    photo_path = UPLOAD_DIR / photo_url.replace("/uploads/", "")

    # 2. Füge zum PDF hinzu
    from reportlab.platypus import Image
    img = Image(str(photo_path), width=10*cm, height=6*cm)
    elements.append(img)
```

**Herausforderungen**:
- Foto-Sizing in PDF (wie groß?)
- Layout: 1 Foto pro Zeile? 2 Spalten?
- Was wenn Foto fehlt auf Volume?
- Kompression für große PDFs?

**Priorität**: MEDIUM (Nice-to-have für MVP)

---

### 🎨 Problem 3: Eingabe-Formular zeigt keine Veränderungen

**Status**: 🔴 OFFEN (verschoben auf Sprint 2)

**Symptome**:
- Modal-Styling wurde verbessert im Code ✅
- Deployment war erfolgreich ✅
- **ABER**: Alte Darstellung wird angezeigt ❌

**Erwartete Änderungen** (aus Code):
```tsx
// Sollte sichtbar sein:
- Form-Hintergrund: bg-gray-50 (hellgrau)
- Labels: text-base font-semibold (größer, fetter)
- Inputs: text-lg px-5 py-4 (größer, mehr Padding)
- Buttons: px-8 py-4 text-lg font-semibold
- Foto-Thumbnails: h-20 (kompakt, 4 Spalten)
```

**Diagnose-Schritte für Sprint 2**:
1. **Browser-Cache**:
   ```
   - Hard-Refresh: Ctrl+F5
   - DevTools → Disable Cache
   - Inkognito-Modus
   ```

2. **Deployed Files prüfen**:
   ```bash
   # Prüfe ob richtige Datei online ist
   curl -s "https://www.dabrock.info/lifechronicle/index.html" | grep "index-"
   # Sollte zeigen: index-DIDTxqQx.js (neueste Version)
   ```

3. **CSS prüfen**:
   ```bash
   # Lade CSS und suche nach neuen Klassen
   curl -s "https://www.dabrock.info/lifechronicle/assets/index-Djftbc8H.css" | grep "bg-gray-50"
   ```

4. **JS prüfen**:
   ```javascript
   // Browser DevTools → Sources → index-DIDTxqQx.js
   // Suche nach: "bg-gray-50", "text-base font-semibold"
   ```

**Mögliche Ursachen**:
1. ❌ Browser lädt gecachte alte Dateien
2. ❌ Strato hat neue Dateien nicht korrekt gespeichert
3. ❌ CSS-Klassen werden von Tailwind nicht generiert
4. ❌ React-Komponente rendert alte Version

**Quick-Fix für Sprint 2**:
```bash
# Komplettes Neu-Deployment
cd /mnt/e/CodelocalLLM/LifeChronicle
rm -rf dist node_modules/.vite
npm install
./deploy.sh
```

**Priorität**: LOW (Funktionalität ist da, nur Styling fehlt)

---

## Sprint 3: Advanced Features

### 📸 Feature 1: Foto-Zoom in Timeline

**Status**: 🟡 BACKLOG

**Beschreibung**:
- Klick auf Foto → Lightbox mit größerer Ansicht
- Navigation zwischen Fotos (Prev/Next)
- Schließen mit ESC oder X

**Libraries**:
- `react-image-lightbox` oder
- `yet-another-react-lightbox`

---

### 🎤 Feature 2: Voice-to-Text Verbesserungen

**Status**: 🟡 BACKLOG

**Aktuelle Implementierung**:
- Web Speech API (nur Chrome)
- Nur Deutsch

**Verbesserungen**:
- Multi-Language Support (EN, ES)
- Fallback für andere Browser
- Längere Aufnahmen (Continuous Recording)

---

### 🌍 Feature 3: Foto-GPS-Daten auf Karte anzeigen

**Status**: 🟡 BACKLOG

**Beschreibung**:
- EXIF GPS-Daten werden bereits extrahiert ✅
- Zeige Fotos auf interaktiver Karte (Leaflet/OpenStreetMap)
- Gruppiere Einträge nach Ort

**Daten verfügbar**:
```json
{
  "entry_metadata": {
    "photos": [
      {
        "gps": {
          "latitude": 52.5200,
          "longitude": 13.4050
        }
      }
    ]
  }
}
```

---

## 🎯 Sprint 1: ABGESCHLOSSEN ✅

### Was funktioniert:

1. ✅ **Entry Creation**
   - Titel, Datum, Text eingeben
   - Fotos hochladen (max 5)
   - Speichern in PostgreSQL

2. ✅ **Timeline Anzeige**
   - Chronologische Sortierung
   - Alternating Left/Right Layout
   - Farbige Timeline-Dots
   - Jahr auf Dot anzeigen

3. ✅ **LLM Processing**
   - Text mit Ollama/GROK verarbeiten
   - ✨-Button für Refinement
   - Spinner während Processing

4. ✅ **PDF Export**
   - Farbige Timeline-Kapitel
   - Chronologische Reihenfolge
   - HTML-Escaping (keine Crashes)
   - Download als "my-life-chronicle.pdf"

5. ✅ **Multi-Language**
   - DE/EN/ES Toggle
   - Backend-Übersetzungen
   - Fallback bei Backend-Ausfall

6. ✅ **Backend**
   - PostgreSQL Storage
   - Railway Auto-Deploy
   - Static Files für Uploads
   - Demo-Auth

7. ✅ **Frontend**
   - Strato SFTP Deployment
   - Automated deploy.sh Script
   - Version-Hashed Assets

8. ✅ **Dokumentation**
   - DEPLOYMENT.md (485 Zeilen)
   - deploy.sh (automatisiert)
   - SPRINT_BACKLOG.md (diese Datei)

---

## 📊 Prioritäten

### Sprint 2: Layout & UX (nächster Sprint)
- 🔴 **HIGH**: Fotos in Timeline anzeigen
- 🟠 **MEDIUM**: Fotos in PDF exportieren
- 🟡 **LOW**: Eingabe-Formular-Styling

### Sprint 3: Advanced Features (später)
- Foto-Zoom/Lightbox
- Voice-to-Text Verbesserungen
- GPS-Karte

---

## 🐛 Bekannte technische Schulden

1. **Node.js Version**
   - Aktuell: Node 18.19.1
   - Vite empfiehlt: Node 20.19+
   - Impact: Warnungen im Build (funktioniert aber)

2. **Browser-Cache-Management**
   - User müssen manuell Ctrl+F5 drücken
   - Mögliche Lösung: Service Worker für Cache-Invalidation

3. **SFTP Deployment**
   - Credentials hardcoded in deploy.sh
   - Besser: Environment Variables

4. **Error Handling**
   - Viele try/catch ohne User-Feedback
   - Bessere Error-Messages nötig

---

## 📝 Notizen für Sprint 2

### Debugging-Strategie: Fotos in Timeline

1. **Backend prüfen** (sollte OK sein):
   ```bash
   curl "https://general-backend-production-a734.up.railway.app/uploads/lifechronicle/xxx.jpg"
   # Sollte: HTTP 200 + Bild
   ```

2. **Frontend prüfen**:
   ```javascript
   // Browser Console → Entries inspizieren
   console.log(entries[0].photo_urls)
   // Sollte: Array mit URLs
   ```

3. **Network Tab**:
   ```
   F12 → Network → Filter: Img
   - Werden Foto-Requests gemacht?
   - Status 200 oder 404?
   - CORS-Fehler?
   ```

4. **React DevTools**:
   ```
   - Komponente: TimelineEntry
   - Props: entry.photo_urls
   - Ist das Array leer oder gefüllt?
   ```

### Wenn Browser-Cache das Problem ist:

**Lösung A**: Cache-Busting in HTML
```html
<!-- Statt: -->
<script src="/assets/index-ABC123.js"></script>

<!-- Besser: -->
<script src="/assets/index-ABC123.js?v=20251226"></script>
```

**Lösung B**: Service Worker
```javascript
// Invalidate cache on new version
self.addEventListener('activate', (event) => {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cache) => caches.delete(cache))
    );
  });
});
```

**Lösung C**: Meta-Tags
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

---

## 🎯 Definition of Done (für Sprint 2)

### Fotos in Timeline:
- [ ] Fotos erscheinen in Timeline (2-Spalten-Grid)
- [ ] Lazy Loading funktioniert
- [ ] Hover-Effekt (Shadow-Transition)
- [ ] Getestet in 3 Browsern (Chrome, Firefox, Safari)
- [ ] Mobile responsive

### Fotos in PDF:
- [ ] Fotos werden im PDF angezeigt
- [ ] Vernünftige Größe (nicht zu groß/klein)
- [ ] Kompression für große PDFs (<10 MB)
- [ ] Fehlerbehandlung wenn Foto fehlt

### Eingabe-Formular-Styling:
- [ ] Grauer Hintergrund sichtbar
- [ ] Labels größer als Inputs
- [ ] Buttons größer und fetter
- [ ] Foto-Thumbnails kompakt (h-20)
- [ ] Cross-Browser getestet

---

**Letzte Aktualisierung**: 2025-12-26
**Sprint 1 Status**: ✅ ABGESCHLOSSEN
**Sprint 2 Start**: TBD
