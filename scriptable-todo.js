// Scriptable Widget für Todo-App
// Installiere Scriptable aus dem App Store, dann kopiere dieses Script in die App

// ===== KONFIGURATION =====
const WIDGET_API_URL = 'https://todo-eight-pi-66.vercel.app/widget-api.html';
const SUPABASE_URL = 'https://yzdcfxylvymaybgoetjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGNmeHlsdnltYXliZ29ldGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTg0NzgsImV4cCI6MjA4MjY3NDQ3OH0.ek5V6ii7cAU5SMk_tIDyYZbWctXvmvEzRCvNYl3C2SE';

// Farben (passend zum Foto-Design)
const COLORS = {
  background: '#1a1a1a',        // Dunkler Hintergrund
  card: '#2d2d2d',              // Dunkelgraue Karte (charcoal)
  border: '#4a4a4a',           // Hellgrauer Rand
  primary: '#4a9eff',          // Helles Blau
  text: '#ffffff',             // Weißer Text
  textSecondary: '#b0b0b0',    // Hellgrauer Text
  textMuted: '#808080'         // Gedämpfter Text
};

// ===== HAUPTFUNKTION =====
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(COLORS.background);
  widget.setPadding(16, 16, 16, 16);
  
  // Daten laden
  const data = await loadTodoData();
  
  if (!data) {
    return createErrorWidget();
  }
  
  // Widget-Größe bestimmen
  const config = getWidgetConfig();
  
  if (config.family === 0) { // Small (2x2)
    return createSmallWidget(widget, data);
  } else if (config.family === 1) { // Medium (4x2)
    return createMediumWidget(widget, data);
  } else { // Large (4x4)
    return createLargeWidget(widget, data);
  }
}

// ===== DATEN LADEN =====
async function loadTodoData() {
  try {
    // Versuche zuerst die API
    const apiUrl = WIDGET_API_URL;
    const req = new Request(apiUrl);
    req.headers = {
      'Accept': 'application/json'
    };
    const data = await req.loadJSON();
    return data;
  } catch (error) {
    console.log('API Error:', error);
    // Fallback: Direkt Supabase abfragen
    return await loadFromSupabase();
  }
}

async function loadFromSupabase() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `${SUPABASE_URL}/rest/v1/todos?date=eq.${today}&order=completed.asc,planned_hours.desc`;
    
    const req = new Request(url);
    req.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept': 'application/json'
    };
    
    const todos = await req.loadJSON();
    
    // Berechne Stunden
    const totalPlanned = todos.reduce((sum, t) => sum + (parseFloat(t.planned_hours) || 0), 0);
    const totalUsed = todos.reduce((sum, t) => sum + (parseFloat(t.used_hours) || 0), 0);
    
    return {
      date: today,
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      totalPlanned: totalPlanned,
      totalUsed: totalUsed,
      todos: todos
    };
  } catch (error) {
    console.log('Supabase Error:', error);
    return null;
  }
}

// ===== WIDGET ERSTELLEN =====
function createSmallWidget(widget, data) {
  return createMainWidget(widget, data);
}

function createMediumWidget(widget, data) {
  return createMainWidget(widget, data);
}

function createLargeWidget(widget, data) {
  return createMainWidget(widget, data);
}

function createMainWidget(widget, data) {
  // Direkt im Widget ohne Karte - fullscreen, nach oben verschoben
  widget.setPadding(8, 16, 16, 16); // Weniger Padding oben
  
  const contentStack = widget.addStack();
  contentStack.layoutVertically();
  contentStack.spacing = 12;
  
  // "HEUTE" Text oben links
  const heuteText = contentStack.addText('HEUTE');
  heuteText.font = Font.boldSystemFont(20);
  heuteText.textColor = new Color(COLORS.primary);
  heuteText.leftAlignText(); // Linksbündig
  
  // Aufgabenliste - zeige alle Aufgaben für heute
  const todayTodos = data.todos || [];
  const maxTasks = 5; // Maximal 5 Aufgaben anzeigen
  
  for (let i = 0; i < Math.min(todayTodos.length, maxTasks); i++) {
    const todo = todayTodos[i];
    
    // Aufgabe mit Kreis
    const aufgabeStack = contentStack.addStack();
    aufgabeStack.layoutHorizontally();
    aufgabeStack.spacing = 10;
    
    // Kreis (Checkbox-Stil: grauer Hintergrund mit blauem Rand)
    const circleStack = aufgabeStack.addStack();
    circleStack.size = new Size(20, 20);
    circleStack.backgroundColor = new Color('#3a3a3a'); // Grauer Hintergrund
    circleStack.cornerRadius = 10;
    circleStack.borderWidth = 1.5;
    circleStack.borderColor = new Color(COLORS.primary); // Blauer Rand
    
    // Wenn erledigt, Kreis ausfüllen
    if (todo.completed) {
      circleStack.backgroundColor = new Color(COLORS.primary);
    }
    
    // Aufgaben-Text
    const aufgabeText = aufgabeStack.addText(todo.text || 'Unbenannte Aufgabe');
    aufgabeText.font = Font.regularSystemFont(14);
    aufgabeText.textColor = todo.completed ? new Color(COLORS.textMuted) : new Color(COLORS.text);
    aufgabeText.leftAlignText(); // Linksbündig
    if (todo.completed) {
      aufgabeText.strikethrough = true;
    }
  }
  
  // Stunden-Anzeige "2,9H / 4H" - unter den Aufgaben
  const hoursText = contentStack.addText('');
  const usedHours = data.totalUsed.toFixed(1).replace('.', ',');
  const plannedHours = data.totalPlanned.toFixed(1).replace('.', ',');
  hoursText.text = `${usedHours}H / ${plannedHours}H`;
  hoursText.font = Font.regularSystemFont(13);
  hoursText.textColor = new Color(COLORS.text);
  hoursText.leftAlignText(); // Linksbündig
  
  // Progress Bar und Prozentanzeige in einer Zeile - unter der Stunden-Anzeige
  const progressStack = contentStack.addStack();
  progressStack.layoutHorizontally();
  progressStack.spacing = 10;
  
  // Berechne Fortschritt
  const progress = data.totalPlanned > 0 ? Math.min(data.totalUsed / data.totalPlanned, 1) : 0;
  const percent = Math.round(progress * 100);
  
  // Progress Bar mit Canvas zeichnen
  const barWidth = 140;
  const barHeight = 2;
  const canvas = new DrawContext();
  canvas.size = new Size(barWidth, barHeight);
  
  // Hintergrund
  canvas.setFillColor(new Color(COLORS.border));
  canvas.fillRect(new Rect(0, 0, barWidth, barHeight));
  
  // Progress Bar
  if (progress > 0) {
    const progressWidth = Math.max(2, progress * barWidth);
    canvas.setFillColor(new Color(COLORS.primary));
    canvas.fillRect(new Rect(0, 0, progressWidth, barHeight));
  }
  
  const progressImage = canvas.getImage();
  const progressImg = progressStack.addImage(progressImage);
  progressImg.imageSize = new Size(barWidth, barHeight);
  
  // Prozentanzeige rechts vom Balken
  const percentText = progressStack.addText(`${percent}%`);
  percentText.font = Font.regularSystemFont(13);
  percentText.textColor = new Color(COLORS.text);
  percentText.leftAlignText(); // Linksbündig
  
  return widget;
}

function createErrorWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(COLORS.background);
  widget.setPadding(16, 16, 16, 16);
  
  const errorText = widget.addText('Fehler beim Laden');
  errorText.font = Font.regularSystemFont(14);
  errorText.textColor = new Color(COLORS.textSecondary);
  errorText.centerAlignText();
  
  return widget;
}

function getWidgetConfig() {
  if (config.runsInWidget) {
    return { family: config.widgetFamily };
  }
  return { family: 1 }; // Default: Medium
}

// ===== WIDGET AUSFÜHREN =====
const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}
Script.complete();

