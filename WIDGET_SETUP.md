# iOS Widget Setup - Schritt für Schritt Anleitung

Diese Anleitung zeigt dir, wie du ein iOS Widget für deine Todo-App mit iOS Shortcuts erstellst.

## 📋 Voraussetzungen

- iPhone oder iPad mit iOS 14 oder neuer
- Safari Browser
- Shortcuts App (kostenlos im App Store)

## 🎯 Schritt 1: Widget-Seite öffnen

1. Öffne deine Todo-App im Safari Browser
2. Navigiere zur Widget-Seite: `https://deine-domain.de/widget.html`
3. Stelle sicher, dass die Seite korrekt lädt und deine Todos anzeigt

## 📱 Schritt 2: Shortcut erstellen

### 2.1 Shortcuts App öffnen

1. Öffne die **Shortcuts App** auf deinem iPhone/iPad
2. Tippe auf das **"+"** Symbol oben rechts
3. Tippe auf **"Shortcut hinzufügen"**

### 2.2 Aktion hinzufügen: Webseite öffnen

1. Tippe auf **"Aktion hinzufügen"**
2. Suche nach **"Webseite öffnen"** oder **"URL öffnen"**
3. Tippe auf die Aktion, um sie hinzuzufügen
4. Gib die URL deiner Widget-Seite ein:
   ```
   https://deine-domain.de/widget.html
   ```
5. Aktiviere **"In Safari öffnen"** → **AUS** (wichtig für Widget!)

### 2.3 Shortcut benennen

1. Tippe auf **"Shortcut-Name"** oben
2. Benenne den Shortcut: **"Todo Widget"** oder **"Meine Aufgaben"**
3. Tippe auf **"Fertig"**

## 🎨 Schritt 3: Widget auf Home-Bildschirm hinzufügen

### 3.1 Widget-Vorschau erstellen

1. Gehe zurück zur **Shortcuts App**
2. Tippe auf deinen erstellten Shortcut
3. Tippe auf das **"..."** Symbol oben rechts
4. Tippe auf **"Zu Home-Bildschirm hinzufügen"**

### 3.2 Widget konfigurieren

1. **Name:** "Todo Widget" (oder wie du möchtest)
2. **Symbol:** Tippe auf das Symbol, um ein eigenes Icon zu wählen
   - Du kannst ein Foto auswählen oder ein Emoji verwenden (z.B. ✅ oder 📝)
3. Tippe auf **"Hinzufügen"**

### 3.3 Widget platzieren

1. Das Widget erscheint jetzt auf deinem Home-Bildschirm
2. Du kannst es wie jede andere App verschieben und organisieren
3. Tippe auf das Widget, um deine Todos anzuzeigen

## 🔄 Schritt 4: Widget aktualisieren (Optional)

Wenn du möchtest, dass das Widget automatisch aktualisiert wird:

### 4.1 Automatisierung erstellen

1. Öffne die **Shortcuts App**
2. Gehe zum Tab **"Automatisierung"**
3. Tippe auf **"+"** oben rechts
4. Wähle **"Persönliche Automatisierung erstellen"**

### 4.2 Trigger einstellen

1. Wähle **"Tageszeit"** als Trigger
2. Stelle die Zeit ein (z.B. 8:00 Uhr)
3. Wähle **"Täglich"**
4. Tippe auf **"Weiter"**

### 4.3 Aktion hinzufügen

1. Tippe auf **"Aktion hinzufügen"**
2. Suche nach **"Shortcut ausführen"**
3. Wähle deinen **"Todo Widget"** Shortcut
4. Tippe auf **"Weiter"**
5. Deaktiviere **"Vor Ausführung fragen"** (wichtig!)
6. Tippe auf **"Fertig"**

## 📊 Schritt 5: Erweiterte Widgets (Optional)

### 5.1 Widget mit Statistiken

Du kannst auch ein Widget erstellen, das nur Statistiken anzeigt:

1. Erstelle einen neuen Shortcut
2. Füge **"Webseite öffnen"** hinzu
3. URL: `https://deine-domain.de/widget-api.html`
4. Füge **"Text aus Webinhalt"** hinzu
5. Füge **"Text anzeigen"** hinzu

### 5.2 Widget mit Quick Actions

Du kannst auch Quick Actions erstellen:

1. **"Neue Aufgabe"** Shortcut:
   - URL: `https://deine-domain.de/?action=new`
   
2. **"Heute anzeigen"** Shortcut:
   - URL: `https://deine-domain.de/?date=today`

## 🎯 Schritt 6: Widget-Größen

iOS Shortcuts unterstützen verschiedene Widget-Größen:

- **Klein:** 2x2 Raster
- **Mittel:** 4x2 Raster  
- **Groß:** 4x4 Raster

Du kannst die Größe ändern, indem du:
1. Auf das Widget tippst und hältst
2. **"Widget bearbeiten"** wählst
3. Die gewünschte Größe auswählst

## 🔧 Troubleshooting

### Problem: Widget zeigt keine Daten

**Lösung:**
- Stelle sicher, dass die Widget-Seite korrekt lädt
- Prüfe, ob du eingeloggt bist (falls Login erforderlich)
- Aktualisiere das Widget, indem du darauf tippst

### Problem: Widget öffnet Safari statt App

**Lösung:**
- Stelle sicher, dass **"In Safari öffnen"** in der Shortcut-Aktion **AUS** ist
- Verwende die PWA-Version der App (zum Home-Bildschirm hinzugefügt)

### Problem: Widget aktualisiert sich nicht automatisch

**Lösung:**
- Widgets aktualisieren sich nicht automatisch im Hintergrund
- Du musst auf das Widget tippen, um es zu aktualisieren
- Oder verwende eine Automatisierung (siehe Schritt 4)

## 💡 Tipps

1. **Mehrere Widgets:** Du kannst mehrere Widgets mit verschiedenen Ansichten erstellen
2. **Farben:** Verwende passende Icons/Farben für bessere Erkennbarkeit
3. **Organisation:** Platziere das Widget auf dem ersten Home-Bildschirm für schnellen Zugriff
4. **Backup:** Exportiere deine Shortcuts, um sie zu sichern

## 📱 Beispiel-Widgets

### Widget 1: Heutige Aufgaben
- URL: `widget.html`
- Zeigt alle Aufgaben für heute
- Mit Statistiken

### Widget 2: Schnellzugriff
- URL: `index.html`
- Öffnet die Haupt-App
- Für schnelle Bearbeitung

### Widget 3: Statistiken
- URL: `widget-api.html`
- Zeigt nur Zahlen
- Kompakt und übersichtlich

## ✅ Fertig!

Dein iOS Widget ist jetzt eingerichtet! Tippe darauf, um deine Todos anzuzeigen.

---

**Hinweis:** Diese Lösung verwendet iOS Shortcuts, keine nativen iOS Widgets. Für echte native Widgets bräuchtest du eine native App.

