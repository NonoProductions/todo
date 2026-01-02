# Scriptable Widget Setup - Schritt für Schritt Anleitung

Diese Anleitung zeigt dir, wie du ein vollständig anpassbares iOS Widget für deine Todo-App mit Scriptable erstellst.

## 📋 Voraussetzungen

- iPhone oder iPad mit iOS 14 oder neuer
- **Scriptable App** (kostenlos im App Store)
- Deine Todo-App muss online erreichbar sein (HTTPS)

## 🎯 Schritt 1: Scriptable installieren

1. Öffne den **App Store** auf deinem iPhone/iPad
2. Suche nach **"Scriptable"**
3. Lade die App herunter (kostenlos)
4. Öffne die Scriptable App nach der Installation

## 📝 Schritt 2: Script erstellen

### 2.1 Neues Script erstellen

1. In der Scriptable App tippe auf das **"+"** Symbol oben rechts
2. Ein neues Script wird erstellt
3. Tippe auf den Script-Namen (z.B. "Neues Script")
4. Benenne es um zu: **"Todo Widget"**

### 2.2 Script-Code einfügen

1. Öffne die Datei `scriptable-todo.js` auf deinem Computer
2. Kopiere den gesamten Code
3. Gehe zurück zur Scriptable App
4. Lösche den Standard-Code
5. Füge den kopierten Code ein
6. **Wichtig:** Ändere die URL in Zeile 4:
   ```javascript
   const WIDGET_API_URL = 'https://deine-domain.de/widget-api.html';
   ```
   Ersetze `deine-domain.de` mit deiner tatsächlichen Domain!

### 2.3 Script speichern

1. Tippe auf **"Fertig"** oben rechts
2. Das Script ist jetzt gespeichert

## 🎨 Schritt 3: Widget erstellen

### 3.1 Widget hinzufügen

1. Gehe zum Home-Bildschirm deines iPhones
2. Tippe lange auf eine freie Stelle
3. Tippe auf das **"+"** Symbol oben links
4. Suche nach **"Scriptable"** in der Widget-Liste
5. Wähle eine Widget-Größe:
   - **Klein** (2x2)
   - **Mittel** (4x2)
   - **Groß** (4x4)
6. Tippe auf **"Widget hinzufügen"**

### 3.2 Widget konfigurieren

1. Das Widget erscheint auf deinem Home-Bildschirm
2. Tippe lange auf das Widget
3. Tippe auf **"Widget bearbeiten"**
4. Wähle unter **"Script"** dein **"Todo Widget"** Script aus
5. Das Widget wird automatisch aktualisiert

## 🔄 Schritt 4: Widget aktualisieren

### 4.1 Manuelle Aktualisierung

- Tippe auf das Widget, um es zu aktualisieren
- Oder tippe lange auf das Widget → **"Widget aktualisieren"**

### 4.2 Automatische Aktualisierung

Scriptable-Widgets aktualisieren sich automatisch:
- **Kleine Widgets:** Alle 15 Minuten
- **Mittlere Widgets:** Alle 15 Minuten
- **Große Widgets:** Alle 15 Minuten

Du kannst das Intervall in den iOS-Einstellungen anpassen:
1. Einstellungen → Bildschirmzeit → Immer erlauben
2. Oder: Einstellungen → Widgets → Aktualisierungsintervall

## 🎨 Schritt 5: Design anpassen

### 5.1 Farben ändern

Öffne das Script in Scriptable und ändere die Farben in Zeile 8-14:

```javascript
const COLORS = {
  background: '#1a1a1a',      // Hintergrundfarbe
  primary: '#4a9eff',          // Hauptfarbe (Blau)
  text: '#ffffff',             // Textfarbe
  textSecondary: '#b0b0b0',     // Sekundärtext
  completed: '#6bcf7f',        // Erledigt-Farbe (Grün)
  card: '#252525'              // Karten-Hintergrund
};
```

### 5.2 Schriftgrößen anpassen

Du kannst die Schriftgrößen in den Widget-Funktionen anpassen:
- `Font.boldSystemFont(20)` - Fette Schrift, Größe 20
- `Font.systemFont(14)` - Normale Schrift, Größe 14

### 5.3 Layout anpassen

Die drei Widget-Varianten sind in separaten Funktionen:
- `createSmallWidget()` - Für kleine Widgets (2x2)
- `createMediumWidget()` - Für mittlere Widgets (4x2)
- `createLargeWidget()` - Für große Widgets (4x4)

Du kannst jede Funktion individuell anpassen!

## 📊 Schritt 6: Verschiedene Widget-Varianten

### Variante 1: Kompakt (Klein - 2x2)
- Zeigt nur Hauptstatistik
- Anzahl erledigter Aufgaben
- Verbleibende Stunden
- Minimalistisch

### Variante 2: Standard (Mittel - 4x2)
- Zeigt Statistiken
- 3 wichtigste offene Aufgaben
- Mit Stundenangaben
- Ausgewogen

### Variante 3: Vollständig (Groß - 4x4)
- Alle Statistiken
- Bis zu 8 Aufgaben
- Mit Fortschrittsanzeige
- Detailliert

## 🔧 Schritt 7: Troubleshooting

### Problem: Widget zeigt "Fehler beim Laden"

**Lösung:**
1. Prüfe, ob die URL in Zeile 4 korrekt ist
2. Stelle sicher, dass die URL über HTTPS erreichbar ist
3. Teste die URL im Browser
4. Prüfe, ob `widget-api.html` existiert und funktioniert

### Problem: Widget zeigt keine Daten

**Lösung:**
1. Öffne das Script in Scriptable
2. Tippe auf **"Ausführen"** (Play-Button)
3. Prüfe die Fehlermeldungen in der Konsole
4. Stelle sicher, dass Supabase-Zugriff funktioniert

### Problem: Widget aktualisiert sich nicht

**Lösung:**
1. Tippe auf das Widget zum manuellen Update
2. Prüfe iOS-Einstellungen → Widgets → Aktualisierungsintervall
3. Stelle sicher, dass Scriptable Berechtigungen hat

### Problem: Falsche Daten werden angezeigt

**Lösung:**
1. Prüfe, ob das Datum korrekt ist (zeigt immer "Heute")
2. Stelle sicher, dass deine Todos das richtige Datum haben
3. Teste die API direkt im Browser

## 💡 Erweiterte Anpassungen

### Eigene Funktionen hinzufügen

Du kannst eigene Funktionen zum Script hinzufügen:

```javascript
function formatHours(hours) {
  if (hours < 1) {
    return `${(hours * 60).toFixed(0)}min`;
  }
  return `${hours.toFixed(1)}h`;
}
```

### Zusätzliche Daten anzeigen

Du kannst weitere Daten aus der API anzeigen:

```javascript
// In createMediumWidget() oder createLargeWidget()
if (data.remaining > 0) {
  const warning = widget.addText('⚠️ Noch Aufgaben offen!');
  warning.textColor = new Color('#ffd93d');
}
```

### Interaktive Elemente

Scriptable unterstützt auch interaktive Elemente (iOS 17+):

```javascript
// Button zum Öffnen der App
const button = widget.addStack();
button.url = 'https://deine-domain.de/';
button.backgroundColor = new Color(COLORS.primary);
```

## 🎯 Beispiel-Anpassungen

### Beispiel 1: Andere Farben

```javascript
const COLORS = {
  background: '#000000',      // Schwarzer Hintergrund
  primary: '#ff6b6b',         // Rot statt Blau
  text: '#ffffff',
  textSecondary: '#cccccc',
  completed: '#51cf66',       // Hellgrün
  card: '#1a1a1a'
};
```

### Beispiel 2: Mehr Informationen

Füge in `createLargeWidget()` hinzu:

```javascript
// Durchschnittliche Stunden pro Aufgabe
const avgHours = data.todos.length > 0 
  ? data.todos.reduce((sum, t) => sum + (t.planned_hours || 0), 0) / data.todos.length 
  : 0;

const avgText = widget.addText(`⏱️ Ø ${avgHours.toFixed(1)}h pro Aufgabe`);
avgText.textColor = new Color(COLORS.textSecondary);
avgText.font = Font.systemFont(12);
```

## 📱 Widget-Größen im Detail

### Klein (2x2)
- **Größe:** ~155x155 Pixel
- **Verwendung:** Schneller Überblick
- **Zeigt:** Hauptstatistik, verbleibende Stunden

### Mittel (4x2)
- **Größe:** ~329x155 Pixel
- **Verwendung:** Standard-Widget
- **Zeigt:** Statistiken, 3 wichtigste Aufgaben

### Groß (4x4)
- **Größe:** ~329x345 Pixel
- **Verwendung:** Detaillierte Ansicht
- **Zeigt:** Alle Statistiken, bis zu 8 Aufgaben

## ✅ Fertig!

Dein Scriptable Widget ist jetzt eingerichtet! Du kannst es jederzeit in Scriptable bearbeiten und anpassen.

---

## 🆚 Scriptable vs. Widgy

**Scriptable Vorteile:**
- ✅ Kostenlos
- ✅ Volle Kontrolle mit JavaScript
- ✅ Sehr flexibel
- ✅ Direkte API-Integration
- ✅ Professionelle Ergebnisse möglich

**Scriptable Nachteile:**
- ❌ Erfordert JavaScript-Kenntnisse
- ❌ Etwas steile Lernkurve

**Widgy Vorteile:**
- ✅ Visueller Editor
- ✅ Einfach zu bedienen
- ✅ Kein Code nötig

**Widgy Nachteile:**
- ❌ Kostenpflichtig
- ❌ Begrenzte Flexibilität

---

**Tipp:** Du kannst beide Apps kombinieren - Scriptable für komplexe Widgets, Widgy für einfache Designs!

