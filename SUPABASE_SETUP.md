# Supabase Setup Anleitung

Diese Anleitung erklärt, wie Sie die Supabase-Datenbank für die Todo-App einrichten.

## Voraussetzungen

- Ein Supabase-Konto (kostenlos auf [supabase.com](https://supabase.com))
- Zugriff auf Ihr Supabase-Projekt

## Setup-Schritte

### 1. Datenbank-Schema erstellen

1. Öffnen Sie Ihr Supabase-Dashboard
2. Navigieren Sie zu **SQL Editor**
3. Öffnen Sie die Datei `supabase_schema.sql` aus diesem Projekt
4. Kopieren Sie den gesamten SQL-Code
5. Fügen Sie ihn in den SQL Editor ein
6. Klicken Sie auf **Run** oder drücken Sie `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 2. API-Keys überprüfen

Die App verwendet bereits die folgenden Supabase-Konfigurationen:

- **SUPABASE_URL**: `https://yzdcfxylvymaybgoetjn.supabase.co`
- **SUPABASE_ANON_KEY**: (siehe `app.js`)

Diese Keys sind bereits in der `app.js` Datei konfiguriert.

### 3. Row Level Security (RLS)

Die Tabelle verwendet Row Level Security. Die Standard-Policy erlaubt allen Benutzern den Zugriff (für Demo-Zwecke).

**Für Produktion:** Passen Sie die Policies in `supabase_schema.sql` an, um benutzerbasierte Zugriffe zu implementieren.

### 4. Testen

1. Öffnen Sie die `index.html` Datei in Ihrem Browser
2. Erstellen Sie eine neue Aufgabe
3. Überprüfen Sie in Supabase unter **Table Editor** → **todos**, ob die Daten gespeichert wurden

## Fallback zu localStorage

Falls Supabase nicht verfügbar ist oder ein Fehler auftritt, verwendet die App automatisch `localStorage` als Fallback. Die Daten werden dann lokal im Browser gespeichert.

## Troubleshooting

### Fehler: "relation todos does not exist"
- Stellen Sie sicher, dass Sie das SQL-Schema erfolgreich ausgeführt haben
- Überprüfen Sie, ob die Tabelle in **Table Editor** sichtbar ist

### Fehler: "new row violates row-level security policy"
- Überprüfen Sie die RLS-Policies in der `supabase_schema.sql`
- Für Tests können Sie RLS temporär deaktivieren: `ALTER TABLE todos DISABLE ROW LEVEL SECURITY;`

### Daten werden nicht gespeichert
- Überprüfen Sie die Browser-Konsole auf Fehler
- Stellen Sie sicher, dass die Supabase-URL und der Anon-Key korrekt sind
- Die App fällt automatisch auf localStorage zurück, wenn Supabase nicht funktioniert

## Erweiterte Konfiguration

### Benutzerbasierte Zugriffe

Wenn Sie Supabase Auth verwenden möchten:

1. Aktivieren Sie Authentication in Ihrem Supabase-Projekt
2. Fügen Sie eine `user_id` Spalte zur `todos` Tabelle hinzu:
   ```sql
   ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id);
   ```
3. Verwenden Sie die auskommentierten Policies in `supabase_schema.sql`
4. Aktualisieren Sie `app.js`, um die `user_id` beim Erstellen von Todos zu setzen

### Backup und Export

- Verwenden Sie die Supabase-Dashboard-Funktionen für Backups
- Oder exportieren Sie Daten über die SQL-API
- Die localStorage-Daten können über die Browser-Entwicklertools exportiert werden

## Support

Bei Problemen:
1. Überprüfen Sie die Browser-Konsole auf Fehlermeldungen
2. Überprüfen Sie die Supabase-Logs im Dashboard
3. Stellen Sie sicher, dass alle Abhängigkeiten korrekt geladen sind

