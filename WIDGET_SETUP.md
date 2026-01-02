# iOS Widget Setup mit Widgy - Schritt für Schritt Anleitung

Diese Anleitung zeigt dir, wie du ein individuelles iOS Widget für deine Todo-App mit der Widgy-App erstellst. Widgy ermöglicht es dir, vollständig anpassbare Widgets mit eigenem Design zu erstellen.

## 📋 Voraussetzungen

- iPhone oder iPad mit iOS 14 oder neuer
- Safari Browser
- **Widgy App** (kostenpflichtig im App Store, ca. 3-5€)
- Deine Todo-App muss online erreichbar sein

## 🎯 Schritt 1: Widget-Seite vorbereiten

1. Öffne deine Todo-App im Safari Browser
2. Navigiere zur Widget-Seite: `https://deine-domain.de/widget.html`
3. Stelle sicher, dass die Seite korrekt lädt und deine Todos anzeigt
4. **Wichtig:** Die Seite muss über HTTPS erreichbar sein (für Widgy erforderlich)

## 📱 Schritt 2: Widgy App installieren

1. Öffne den **App Store** auf deinem iPhone/iPad
2. Suche nach **"Widgy"**
3. Lade die App herunter und installiere sie
4. Öffne die Widgy App nach der Installation

## 🎨 Schritt 3: Neues Widget in Widgy erstellen

### 3.1 Widget-Template auswählen

1. In der Widgy App tippe auf **"+"** (Plus-Symbol) oben rechts
2. Wähle eine Widget-Größe:
   - **Klein** (2x2)
   - **Mittel** (4x2)
   - **Groß** (4x4)
3. Tippe auf **"Leer"** oder **"Von Vorlage"** um zu starten

### 3.2 Web-Content Layer hinzufügen

1. Tippe auf **"Layer hinzufügen"** oder das **"+"** Symbol
2. Wähle **"Web"** oder **"Web View"** aus der Liste
3. Ein neuer Web-Layer wird zu deinem Widget hinzugefügt

### 3.3 URL konfigurieren

1. Tippe auf den **Web-Layer**, den du gerade hinzugefügt hast
2. Im Einstellungsmenü findest du das Feld **"URL"**
3. Gib die URL deiner Widget-Seite ein:
   
   **Für große Widgets (4x4):**
   ```
   https://deine-domain.de/widget.html
   ```
   
   **Für kleine/kompakte Widgets (2x2, 4x2):**
   ```
   https://deine-domain.de/widget-compact.html
   ```
   
4. Aktiviere **"Vollständige Seite laden"** oder **"Full Page"** (falls verfügbar)
5. Stelle sicher, dass **"Skalierung"** auf **"100%"** oder **"Anpassen"** steht

### 3.4 Widget-Design anpassen

Du kannst jetzt dein Widget vollständig anpassen:

1. **Hintergrund:**
   - Tippe auf **"Hintergrund"** → Wähle eine Farbe oder ein Bild
   - Empfehlung: Dunkler Hintergrund (#1a1a1a) passend zu deiner App

2. **Rahmen:**
   - Tippe auf **"Rahmen"** → Füge einen Rahmen hinzu (optional)
   - Farbe: #4a9eff (deine App-Farbe)

3. **Schatten:**
   - Tippe auf **"Schatten"** → Füge einen Schatten hinzu für Tiefe

4. **Weitere Layer:**
   - Füge Text-Layer hinzu für Titel (z.B. "Meine Aufgaben")
   - Füge Icons oder Emojis hinzu
   - Passe die Position und Größe aller Elemente an

### 3.5 Widget speichern

1. Tippe auf **"Speichern"** oder das **"✓"** Symbol oben rechts
2. Gib deinem Widget einen Namen: **"Todo Widget"** oder **"Meine Aufgaben"**
3. Tippe auf **"Fertig"**

## 📲 Schritt 4: Widget zum Home-Bildschirm hinzufügen

### 4.1 Widget auswählen

1. Gehe zurück zur Hauptansicht in Widgy
2. Tippe auf dein erstelltes Widget
3. Tippe auf **"Widget hinzufügen"** oder **"Add Widget"**

### 4.2 Widget-Größe wählen

1. Wähle die gewünschte Widget-Größe:
   - **Klein** (2x2)
   - **Mittel** (4x2)
   - **Groß** (4x4)
2. Tippe auf **"Widget hinzufügen"**

### 4.3 Widget platzieren

1. iOS öffnet automatisch den Home-Bildschirm im Bearbeitungsmodus
2. Wähle eine freie Stelle für dein Widget
3. Das Widget wird jetzt auf deinem Home-Bildschirm angezeigt

## 🔄 Schritt 5: Widget aktualisieren

### 5.1 Manuelle Aktualisierung

- Tippe auf das Widget, um es zu aktualisieren
- Oder tippe lange auf das Widget → **"Widget aktualisieren"**

### 5.2 Automatische Aktualisierung (Optional)

Widgy unterstützt automatische Updates:

1. Öffne Widgy App
2. Gehe zu **"Einstellungen"** oder **"Settings"**
3. Aktiviere **"Automatische Updates"** oder **"Auto Refresh"**
4. Stelle das Update-Intervall ein (z.B. alle 15 Minuten)

## 🎨 Schritt 6: Erweiterte Design-Optionen

### 6.1 Mehrere Layer kombinieren

Du kannst mehrere Web-Layer kombinieren:

1. **Haupt-Layer:** Zeigt `widget.html` (alle Todos)
2. **Statistik-Layer:** Zeigt `widget-api.html` (nur Zahlen)
3. **Text-Layer:** Für Titel und Beschriftungen

### 6.2 Design-Vorlagen

1. In Widgy findest du viele Design-Vorlagen
2. Du kannst eine Vorlage als Basis verwenden
3. Passe sie dann für deine Todo-App an

### 6.3 Farben und Schriftarten

1. **Primärfarbe:** #4a9eff (Blau aus deiner App)
2. **Hintergrund:** #1a1a1a (Dunkelgrau)
3. **Text:** #ffffff (Weiß)
4. **Sekundärfarbe:** #b0b0b0 (Hellgrau)

## 📊 Schritt 7: Verschiedene Widget-Varianten

### Widget 1: Kompakt (Klein - 2x2)
- Zeigt nur die Anzahl der Aufgaben
- Mit kleinem Icon
- Minimalistisches Design

### Widget 2: Standard (Mittel - 4x2)
- Zeigt 3-5 wichtigste Aufgaben
- Mit Statistiken
- Ausgewogenes Design

### Widget 3: Vollständig (Groß - 4x4)
- Zeigt alle Aufgaben für heute
- Mit vollständigen Statistiken
- Detailliertes Design

## 🔧 Troubleshooting

### Problem: Widget zeigt keine Daten

**Lösung:**
- Prüfe, ob die URL korrekt ist und über HTTPS erreichbar
- Stelle sicher, dass die Widget-Seite in Safari korrekt lädt
- Prüfe die Widgy-Einstellungen für Web-Content
- Aktualisiere das Widget manuell

### Problem: Widget lädt langsam

**Lösung:**
- Reduziere die Anzahl der Layer
- Verwende eine kompaktere Version der Widget-Seite
- Prüfe deine Internetverbindung
- Aktiviere Caching in Widgy (falls verfügbar)

### Problem: Design sieht nicht richtig aus

**Lösung:**
- Passe die Größe des Web-Layers an
- Stelle sicher, dass die Widget-Seite responsive ist
- Teste verschiedene Widget-Größen
- Passe die Skalierung in Widgy an

### Problem: Widget aktualisiert sich nicht

**Lösung:**
- Aktiviere automatische Updates in Widgy
- Tippe manuell auf das Widget zum Aktualisieren
- Prüfe die Update-Einstellungen in Widgy

## 💡 Design-Tipps

1. **Konsistenz:** Verwende die gleichen Farben wie in deiner App
2. **Lesbarkeit:** Stelle sicher, dass Text gut lesbar ist
3. **Hierarchie:** Wichtige Informationen größer darstellen
4. **Leerraum:** Lasse genug Platz zwischen Elementen
5. **Icons:** Verwende passende Icons oder Emojis
6. **Schatten:** Füge subtile Schatten für Tiefe hinzu

## 🎯 Beispiel-Widget-Aufbau

```
┌─────────────────────────┐
│  [Icon] Meine Aufgaben  │  ← Text-Layer (Titel)
├─────────────────────────┤
│                         │
│   [Web-Content]         │  ← Web-Layer (widget.html)
│   Zeigt alle Todos      │
│                         │
├─────────────────────────┤
│  📊 5 Aufgaben          │  ← Text-Layer (Statistik)
│  ✅ 2 Erledigt          │
└─────────────────────────┘
```

## 📱 Widget-URLs für verschiedene Ansichten

### Vollständige Ansicht
```
https://deine-domain.de/widget.html
```
- Zeigt alle Todos mit Details
- Mit vollständigen Statistiken
- Für große Widgets (4x4)
- Mehr Padding und größere Schrift

### Kompakte Ansicht
```
https://deine-domain.de/widget-compact.html
```
- Optimiert für kleine Widgets
- Zeigt bis zu 10 Aufgaben
- Kompakteres Design
- Transparenter Hintergrund (für Widgy)
- Für kleine (2x2) und mittlere (4x2) Widgets

### Nur Statistiken (API)
```
https://deine-domain.de/widget-api.html
```
- Zeigt nur JSON-Daten
- Für Text-Layer mit dynamischen Werten
- Kann in Widgy mit Text-Layern kombiniert werden

## ✅ Fertig!

Dein individuelles iOS Widget ist jetzt eingerichtet! Du kannst es jederzeit in Widgy bearbeiten und anpassen.

---

## 🆚 Widgy vs. Kurzbefehle

**Widgy Vorteile:**
- ✅ Vollständig anpassbares Design
- ✅ Mehrere Layer kombinierbar
- ✅ Echte Widget-Größen (nicht nur App-Icon)
- ✅ Professionelles Aussehen
- ✅ Automatische Updates möglich

**Widgy Nachteile:**
- ❌ Kostenpflichtig (einmalig ca. 3-5€)
- ❌ Etwas komplexer zu bedienen

**Kurzbefehle Vorteile:**
- ✅ Kostenlos
- ✅ Einfach zu bedienen
- ✅ Von Apple entwickelt

**Kurzbefehle Nachteile:**
- ❌ Kein individuelles Design
- ❌ Nur App-Icon-Größe
- ❌ Begrenzte Anpassungsmöglichkeiten

---

**Hinweis:** Widgy ist eine Drittanbieter-App, die es ermöglicht, benutzerdefinierte Widgets zu erstellen. Sie ist nicht von Apple entwickelt, aber sehr beliebt und zuverlässig.
