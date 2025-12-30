-- Supabase Schema für Todo-App
-- Erstellen Sie diese Tabelle in Ihrer Supabase-Datenbank

-- Falls die Tabelle bereits existiert, löschen (ACHTUNG: Löscht alle Daten!)
-- DROP TABLE IF EXISTS todos CASCADE;

-- Todos Tabelle erstellen
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    date DATE NOT NULL,
    planned_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    used_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Falls die Tabelle bereits existiert, aber Spalten fehlen, diese hinzufügen:
DO $$ 
BEGIN
    -- Füge planned_hours hinzu, falls es nicht existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todos' AND column_name = 'planned_hours') THEN
        ALTER TABLE todos ADD COLUMN planned_hours DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Füge used_hours hinzu, falls es nicht existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todos' AND column_name = 'used_hours') THEN
        ALTER TABLE todos ADD COLUMN used_hours DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Füge completed hinzu, falls es nicht existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todos' AND column_name = 'completed') THEN
        ALTER TABLE todos ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- Füge date hinzu, falls es nicht existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todos' AND column_name = 'date') THEN
        ALTER TABLE todos ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) aktivieren
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Enable all access for todos" ON todos;

-- Policy: Alle Benutzer können lesen und schreiben (für Demo-Zwecke)
-- Für Produktion sollten Sie benutzerbasierte Policies implementieren
CREATE POLICY "Enable all access for todos" ON todos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Für benutzerbasierte Zugriffe (wenn Sie Auth verwenden)
-- CREATE POLICY "Users can view own todos" ON todos
--     FOR SELECT
--     USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert own todos" ON todos
--     FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can update own todos" ON todos
--     FOR UPDATE
--     USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own todos" ON todos
--     FOR DELETE
--     USING (auth.uid() = user_id);
