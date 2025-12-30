-- Script zum Korrigieren der id-Spalte
-- Führen Sie dieses Script aus, wenn Sie den Fehler "null value in column id" erhalten

-- Prüfe und korrigiere die id-Spalte
DO $$ 
BEGIN
    -- Prüfe, ob die id-Spalte existiert und ob sie einen DEFAULT-Wert hat
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'todos' 
        AND column_name = 'id'
        AND column_default IS NULL
    ) THEN
        -- Setze den DEFAULT-Wert für die id-Spalte
        ALTER TABLE todos 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'id-Spalte wurde korrigiert: DEFAULT gen_random_uuid() wurde hinzugefügt';
    ELSE
        RAISE NOTICE 'id-Spalte ist bereits korrekt konfiguriert';
    END IF;
END $$;

-- Alternative: Falls die Tabelle neu erstellt werden soll (ACHTUNG: Löscht alle Daten!)
-- DROP TABLE IF EXISTS todos CASCADE;
-- 
-- CREATE TABLE todos (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     text TEXT NOT NULL,
--     date DATE NOT NULL,
--     planned_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
--     used_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
--     completed BOOLEAN NOT NULL DEFAULT false,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

