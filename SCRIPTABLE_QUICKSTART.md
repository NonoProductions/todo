# Scriptable Widget - Quick Start

Schnelle Anleitung zum Erstellen deines ersten Todo-Widgets mit Scriptable.

## 🚀 In 5 Minuten zum Widget

### Schritt 1: Scriptable installieren
- App Store → Suche "Scriptable" → Installieren

### Schritt 2: Script kopieren
1. Öffne `scriptable-todo-simple.js` auf deinem Computer
2. Kopiere den gesamten Code
3. Öffne Scriptable App
4. Tippe auf "+" (neues Script)
5. Füge den Code ein
6. **WICHTIG:** Ändere Zeile 5:
   ```javascript
   const WIDGET_API_URL = 'https://DEINE-DOMAIN.de/widget-api.html';
   ```
7. Tippe auf "Fertig"

### Schritt 3: Widget hinzufügen
1. Home-Bildschirm → Lange tippen → "+"
2. Suche "Scriptable"
3. Wähle Größe (z.B. Mittel)
4. "Widget hinzufügen"
5. Lange auf Widget tippen → "Widget bearbeiten"
6. Wähle dein "Todo Widget" Script

### Schritt 4: Fertig! 🎉
Das Widget zeigt jetzt deine Todos an!

---

## 📚 Welches Script verwenden?

### `scriptable-todo-simple.js` (Empfohlen für Einsteiger)
- ✅ Einfach zu verstehen
- ✅ Zeigt die wichtigsten Infos
- ✅ Perfekt für den Start

### `scriptable-todo.js` (Für Fortgeschrittene)
- ✅ Drei verschiedene Widget-Größen
- ✅ Mehr Features
- ✅ Vollständig anpassbar

---

## 🎨 Design anpassen

### Farben ändern
Im Script findest du:
```javascript
widget.backgroundColor = new Color('#1a1a1a');  // Hintergrund
title.textColor = new Color('#4a9eff');          // Titel-Farbe
```

Ändere die Hex-Farben nach deinem Geschmack!

### Mehr Infos anzeigen
Füge einfach neue Zeilen hinzu:
```javascript
widget.addSpacer(8);
const newInfo = widget.addText('Dein Text');
newInfo.textColor = Color.white();
```

---

## ❓ Probleme?

**Widget zeigt Fehler:**
- Prüfe, ob die URL korrekt ist
- Stelle sicher, dass `widget-api.html` erreichbar ist

**Keine Daten:**
- Teste die URL im Browser
- Prüfe, ob du Todos für heute hast

**Mehr Hilfe:**
- Siehe `SCRIPTABLE_SETUP.md` für detaillierte Anleitung

---

**Viel Erfolg! 🎯**

