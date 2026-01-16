# PWA Setup Anleitung

Die Todo-App wurde erfolgreich in eine Progressive Web App (PWA) umgewandelt!

## Was wurde hinzugefügt:

1. **manifest.json** - Definiert die App-Metadaten (Name, Icons, Theme-Farben)
2. **service-worker.js** - Ermöglicht Offline-Funktionalität und Caching
3. **HTML-Updates** - Manifest-Link und Service Worker Registrierung

## Icons erstellen:

1. Öffnen Sie `generate-icons.html` im Browser
2. Die Icons werden automatisch generiert und heruntergeladen
3. Speichern Sie `icon-192.png` und `icon-512.png` im Hauptverzeichnis der App

Alternativ können Sie eigene Icons erstellen:
- **icon-192.png**: 192x192 Pixel
- **icon-512.png**: 512x512 Pixel

## Installation:

### Auf Desktop (Chrome/Edge):
1. Öffnen Sie die App im Browser
2. Klicken Sie auf das Installationssymbol in der Adressleiste
3. Oder: Menü → "App installieren"

### Auf Mobile (Android):
1. Öffnen Sie die App in Chrome
2. Menü → "Zum Startbildschirm hinzufügen"
3. Die App wird wie eine native App installiert

### Auf iOS (Safari):
1. Öffnen Sie die App in Safari
2. Teilen-Button → "Zum Home-Bildschirm"
3. Die App wird installiert

## Features:

- ✅ **Offline-Funktionalität**: Die App funktioniert auch ohne Internetverbindung
- ✅ **Installierbar**: Kann wie eine native App installiert werden
- ✅ **Schnelles Laden**: Wichtige Dateien werden gecacht
- ✅ **App-ähnliches Erlebnis**: Vollbild-Modus ohne Browser-UI

## Wichtige Hinweise:

- Die App muss über HTTPS (oder localhost) gehostet werden, damit der Service Worker funktioniert
- Für die Produktion sollten Sie die Icons durch professionelle Designs ersetzen
- Der Service Worker cached nur lokale Dateien, nicht externe Ressourcen (Supabase, CDN)

## Testen:

1. Öffnen Sie die App im Browser
2. Öffnen Sie die Entwicklertools (F12)
3. Gehen Sie zu "Application" → "Service Workers"
4. Prüfen Sie, ob der Service Worker registriert ist
5. Gehen Sie zu "Application" → "Manifest" um das Manifest zu prüfen

## Troubleshooting:

- **Service Worker wird nicht registriert**: Stellen Sie sicher, dass die App über HTTPS oder localhost läuft
- **Icons werden nicht angezeigt**: Prüfen Sie, ob die Icon-Dateien im richtigen Verzeichnis liegen
- **App funktioniert nicht offline**: Prüfen Sie die Browser-Konsole auf Fehler



