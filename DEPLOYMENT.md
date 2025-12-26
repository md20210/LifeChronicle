# LifeChronicle Deployment Guide

## 📋 Übersicht

Dieses Dokument beschreibt den Deployment-Prozess für LifeChronicle Frontend und Backend.

---

## 🚀 Frontend Deployment (Strato SFTP)

### Automatisches Deployment

**Einfachste Methode** - Verwende das automatisierte Skript:

```bash
./deploy.sh
```

Das Skript führt automatisch aus:
1. ✅ **Build** - `npm run build`
2. ✅ **Cleanup** - Löscht alte JS/CSS-Dateien vom Server
3. ✅ **Upload** - Lädt neue Dateien zu Strato hoch
4. ✅ **Verification** - Prüft, ob Deployment erfolgreich war

### Was das Skript macht

```
[1/5] Building frontend...
      - Erstellt optimierten Production-Build in dist/

[2/5] Extracting asset filenames...
      - Liest index.html
      - Extrahiert JS-Dateinamen (z.B. index-huJgLT-r.js)
      - Extrahiert CSS-Dateinamen (z.B. index-EHAHixPe.css)

[3/5] Cleaning old assets on server...
      - Listet alle .js/.css Dateien auf dem Server
      - Löscht alte Versionen (außer den aktuellen)
      - Verhindert Browser-Cache-Probleme

[4/5] Uploading new files...
      - Lädt index.html hoch
      - Lädt neue JS-Datei hoch
      - Lädt neue CSS-Datei hoch

[5/5] Verifying deployment...
      - Prüft, ob index.html die richtigen Dateien referenziert
      - Bestätigt erfolgreiche Deployment
```

### Manuelles Deployment (Fallback)

Falls das Skript nicht funktioniert:

```bash
# 1. Build
npm run build

# 2. Manuelle Uploads
SFTP_USER="su403214"
SFTP_PASS="deutz15!2000"
SFTP_HOST="5018735097.ssh.w2.strato.hosting"

# Upload index.html
curl -T dist/index.html --user "$SFTP_USER:$SFTP_PASS" \
  "sftp://$SFTP_HOST/dabrock-info/lifechronicle/" -k

# Upload JS (Dateinamen aus dist/index.html holen)
curl -T dist/assets/index-XXXXX.js --user "$SFTP_USER:$SFTP_PASS" \
  "sftp://$SFTP_HOST/dabrock-info/lifechronicle/assets/" -k

# Upload CSS
curl -T dist/assets/index-XXXXX.css --user "$SFTP_USER:$SFTP_PASS" \
  "sftp://$SFTP_HOST/dabrock-info/lifechronicle/assets/" -k
```

### Nach dem Deployment

1. **Öffne**: https://www.dabrock.info/lifechronicle/
2. **Hard-Refresh**: `Ctrl+F5` (Windows) oder `Cmd+Shift+R` (Mac)
3. **Teste**:
   - ✅ Modal öffnet sich korrekt
   - ✅ Fotos werden angezeigt
   - ✅ PDF-Export funktioniert

---

## 🔧 Backend Deployment (Railway)

### Automatisches Deployment

Backend deployt **automatisch** bei jedem Push zu GitHub:

```bash
cd /mnt/e/CodelocalLLM/GeneralBackend

# Änderungen committen
git add .
git commit -m "Deine Commit-Message"

# Push zu GitHub → Railway deployt automatisch
git push
```

### Railway Dashboard

- **URL**: https://railway.app/
- **Projekt**: GeneralBackend
- **Service**: general-backend-production-a734
- **Domain**: https://general-backend-production-a734.up.railway.app

### Deployment-Status prüfen

1. Öffne Railway Dashboard
2. Klicke auf "GeneralBackend" Projekt
3. Schau unter "Deployments":
   - ⏳ **Building** - Deployment läuft
   - ✅ **Success** - Deployment erfolgreich
   - ❌ **Failed** - Deployment fehlgeschlagen

**Dauer**: ~2-3 Minuten

### Health Check

```bash
# Backend Health
curl https://general-backend-production-a734.up.railway.app/health

# LifeChronicle Service Health
curl https://general-backend-production-a734.up.railway.app/lifechronicle/health
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "service": "lifechronicle",
  "version": "2.0.0",
  "database": "postgresql"
}
```

---

## 🐛 Häufige Probleme & Lösungen

### Problem 1: "Keine Layout-Änderungen sichtbar"

**Ursache**: Browser-Cache

**Lösung**:
```
1. Hard-Refresh: Ctrl+F5 (Windows) oder Cmd+Shift+R (Mac)
2. ODER Inkognito-Modus: Ctrl+Shift+N
3. ODER Browser-Cache leeren:
   - Chrome: Ctrl+Shift+Del → "Cached images and files"
   - Firefox: Ctrl+Shift+Del → "Cache"
```

### Problem 2: "Fotos werden nicht angezeigt"

**Diagnose**:
```bash
# Prüfe, ob Backend Fotos ausliefert
curl -I https://general-backend-production-a734.up.railway.app/uploads/lifechronicle/test.jpg
```

**Erwartete Antwort**: HTTP 200 (oder 404 wenn Datei nicht existiert)

**Wenn 404 auf alle Uploads**:
- Backend muss `/uploads` mounten (siehe `backend/main.py`)
- StaticFiles mount fehlt → Backend neu deployen

### Problem 3: "PDF-Export crasht"

**Diagnose**:
```bash
# Hole Token
TOKEN=$(curl -s https://general-backend-production-a734.up.railway.app/demo/token | jq -r .access_token)

# Teste PDF-Export
curl -s "https://general-backend-production-a734.up.railway.app/lifechronicle/export/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  --output test.pdf

# Prüfe Datei
file test.pdf
```

**Wenn JSON statt PDF zurückkommt**:
```bash
cat test.pdf | jq .
```

**Häufige Fehler**:
- `"paraparser: syntax error"` → Text enthält ungültige HTML-Tags
  - **Fix**: HTML-Escaping in `backend/api/lifechronicle.py` (bereits gefixt)

### Problem 4: "Alte Dateien bleiben auf Strato"

**Ursache**: Manuelle Uploads löschen alte Dateien nicht

**Lösung**:
```bash
# IMMER das deploy.sh Skript verwenden:
./deploy.sh

# Das Skript löscht automatisch alte Dateien
```

### Problem 5: "Build schlägt fehl"

**Diagnose**:
```bash
npm run build
```

**Häufige Fehler**:
- **TypeScript-Fehler**: `npm run build` zeigt Fehler → Code fixen
- **Node-Version zu alt**: Upgrade zu Node 20+ (aktuell: 18.19.1)
  ```bash
  node --version  # Sollte >= 20.19
  ```

---

## 📁 Datei-Struktur

### Frontend (Strato)

```
/dabrock-info/lifechronicle/
├── index.html               # Haupt-HTML-Datei
├── lc-icon.svg             # Favicon
└── assets/
    ├── index-XXXXX.js      # Haupt-JavaScript (Vite-generiert)
    └── index-XXXXX.css     # Haupt-CSS (Vite-generiert)
```

**WICHTIG**: `XXXXX` ist ein Hash, der sich bei jedem Build ändert!
- Beispiel: `index-huJgLT-r.js`
- Das deploy.sh Skript löscht alte Versionen automatisch

### Backend (Railway)

```
/app/
├── backend/
│   ├── main.py             # FastAPI App mit StaticFiles mount
│   ├── api/
│   │   └── lifechronicle.py  # LifeChronicle Endpoints
│   └── services/
└── uploads/                 # Persistent Volume (Railway)
    └── lifechronicle/
        ├── xxx.jpg         # Hochgeladene Fotos
        └── yyy.png
```

**Railway Volume**: `/app/uploads` (persistent storage)

---

## ✅ Deployment Checklist

### Vor dem Deployment

- [ ] Alle Änderungen getestet?
- [ ] TypeScript-Errors behoben? (`npm run build`)
- [ ] Git committed?
  ```bash
  git status  # Sollte clean sein oder nur gewollte Änderungen
  ```

### Frontend Deployment

- [ ] `./deploy.sh` ausgeführt
- [ ] Script zeigt "✓ Deployment Successful!"
- [ ] URL getestet: https://www.dabrock.info/lifechronicle/
- [ ] Hard-Refresh gemacht (`Ctrl+F5`)

### Backend Deployment

- [ ] Git pushed: `git push`
- [ ] Railway Dashboard geprüft → "Success"
- [ ] Health-Check erfolgreich:
  ```bash
  curl https://general-backend-production-a734.up.railway.app/lifechronicle/health
  ```

### Post-Deployment Tests

- [ ] **Entry erstellen**: Neuer Eintrag mit Titel, Datum, Text
- [ ] **Foto hochladen**: Entry mit Foto → Foto erscheint in Timeline
- [ ] **LLM-Processing**: Entry mit ✨-Button verarbeiten
- [ ] **PDF-Export**: "Export as PDF" → PDF-Download funktioniert
- [ ] **Mehrere Sprachen**: DE/EN/ES-Toggle testen

---

## 🔐 Credentials

### Strato SFTP

```bash
Host: 5018735097.ssh.w2.strato.hosting
User: su403214
Pass: deutz15!2000
Path: /dabrock-info/lifechronicle/
```

**WICHTIG**: Credentials sind im deploy.sh hardcoded!
- ⚠️ **Nicht** in öffentliches Repository pushen
- ✅ `.gitignore` prüfen: `deploy.sh` sollte ignoriert werden

### Railway

- **Login**: https://railway.app/
- **GitHub Account**: Dein GitHub-Account mit OAuth verbunden
- **Auto-Deploy**: Bei Push zu `main` Branch

---

## 📊 Monitoring & Logs

### Frontend Logs (Browser)

```javascript
// Browser DevTools (F12)
// Console zeigt:
console.log('Creating entry with data:', { title, date, text })
console.log('✅ Demo authentication initialized')
console.error('❌ Failed to create entry:', error)
```

### Backend Logs (Railway)

1. Öffne Railway Dashboard
2. Klicke auf "GeneralBackend"
3. Tab: "Deployments" → Klicke auf aktives Deployment
4. Tab: "Logs"

**Wichtige Log-Messages**:
```
INFO: Static files mounted: /uploads -> /app/uploads
INFO: Starting General Backend...
INFO: Database tables created/verified
```

### Railway Database Logs

```bash
# PostgreSQL Verbindung prüfen
# Railway Dashboard → GeneralBackend → PostgreSQL → Connect
```

---

## 🔄 Rollback-Strategie

### Frontend Rollback

**Wenn neues Deployment fehlerhaft ist:**

1. Finde vorherige funktionierende Version:
   ```bash
   git log --oneline -10  # Zeigt letzte 10 Commits
   ```

2. Checkout zu altem Commit:
   ```bash
   git checkout <commit-hash>
   ```

3. Deploye alte Version:
   ```bash
   ./deploy.sh
   ```

4. Zurück zu main:
   ```bash
   git checkout main
   ```

### Backend Rollback (Railway)

1. Railway Dashboard → GeneralBackend
2. Tab: "Deployments"
3. Finde funktionierende Deployment
4. Klicke "⋮" → "Redeploy"

**ODER via Git:**
```bash
cd /mnt/e/CodelocalLLM/GeneralBackend
git revert <bad-commit-hash>
git push  # Railway deployt automatisch
```

---

## 📝 Beispiel: Komplettes Deployment

```bash
# 1. Frontend-Änderungen machen
cd /mnt/e/CodelocalLLM/LifeChronicle
# ... Code ändern ...

# 2. Testen
npm run dev
# Browser: http://localhost:5173

# 3. Committen
git add .
git commit -m "Fix modal styling and photo thumbnails"
git push

# 4. Deployen
./deploy.sh

# Output:
# ═══════════════════════════════════════
#    LifeChronicle Deployment Script
# ═══════════════════════════════════════
# [1/5] Building frontend...
# ✓ Build successful
# [2/5] Extracting asset filenames...
#   JS:  index-NEW123.js
#   CSS: index-NEW456.css
# [3/5] Cleaning old assets on server...
#   Deleting old files:
#     - index-OLD789.js
#     - index-OLD012.css
# ✓ Old files deleted
# [4/5] Uploading new files...
#   Uploading index.html...
#   Uploading index-NEW123.js...
#   Uploading index-NEW456.css...
# ✓ Upload complete
# [5/5] Verifying deployment...
# ✓ Deployment verified - correct files referenced
# ═══════════════════════════════════════
#    ✓ Deployment Successful!
# ═══════════════════════════════════════
# URL: https://www.dabrock.info/lifechronicle/
# ⚠ Note: Clear browser cache with Ctrl+F5 to see changes

# 5. Backend-Änderungen (falls nötig)
cd /mnt/e/CodelocalLLM/GeneralBackend
# ... Code ändern ...
git add .
git commit -m "Add static file serving for photos"
git push  # Railway deployt automatisch

# 6. Warte 2-3 Min auf Railway Deployment
# 7. Teste: https://www.dabrock.info/lifechronicle/
```

---

## 🎯 Best Practices

1. **IMMER deploy.sh verwenden** - Verhindert alte Dateien
2. **Hard-Refresh nach Deployment** - `Ctrl+F5` oder Inkognito
3. **Backend Health-Check** - Vor Frontend-Tests prüfen
4. **Git Commits** - Vor jedem Deployment committen
5. **Railway Logs checken** - Bei Backend-Problemen
6. **Browser DevTools** - Bei Frontend-Problemen (F12 → Console)

---

## 📞 Support

Bei Problemen:

1. **Prüfe diese Dokumentation** - Häufige Probleme & Lösungen
2. **Railway Logs** - Backend-Errors
3. **Browser Console** - Frontend-Errors (F12)
4. **GitHub Issues** - Bugs melden

---

**Zuletzt aktualisiert**: 2025-12-26
**Version**: 1.0
