// Scriptable Widget für Todo-App
// Installiere Scriptable aus dem App Store, dann kopiere dieses Script in die App

// ===== KONFIGURATION =====
const WIDGET_API_URL = 'https://deine-domain.de/widget-api.html';
const SUPABASE_URL = 'https://yzdcfxylvymaybgoetjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGNmeHlsdnltYXliZ29ldGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTg0NzgsImV4cCI6MjA4MjY3NDQ3OH0.ek5V6ii7cAU5SMk_tIDyYZbWctXvmvEzRCvNYl3C2SE';

// Farben (passend zu deiner App)
const COLORS = {
  background: '#1a1a1a',
  primary: '#4a9eff',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  completed: '#6bcf7f',
  card: '#252525'
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
    
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const remaining = todos
      .filter(t => !t.completed)
      .reduce((sum, t) => sum + (parseFloat(t.planned_hours) || 0) - (parseFloat(t.used_hours) || 0), 0);
    
    return {
      date: today,
      total: total,
      completed: completed,
      remaining: remaining,
      todos: todos
    };
  } catch (error) {
    console.log('Supabase Error:', error);
    return null;
  }
}

// ===== WIDGET-VARIANTEN =====

// Kleines Widget (2x2)
function createSmallWidget(widget, data) {
  // Titel
  const title = widget.addText('📝 Aufgaben');
  title.textColor = new Color(COLORS.primary);
  title.font = Font.boldSystemFont(16);
  
  widget.addSpacer(8);
  
  // Hauptstatistik
  const mainStat = widget.addText(`${data.completed}/${data.total}`);
  mainStat.textColor = new Color(COLORS.text);
  mainStat.font = Font.boldSystemFont(32);
  
  widget.addSpacer(4);
  
  // Untertitel
  const subtitle = widget.addText('erledigt');
  subtitle.textColor = new Color(COLORS.textSecondary);
  subtitle.font = Font.systemFont(12);
  
  widget.addSpacer(8);
  
  // Verbleibende Stunden
  if (data.remaining > 0) {
    const hours = widget.addText(`${data.remaining.toFixed(1)}h verbleibend`);
    hours.textColor = new Color(COLORS.primary);
    hours.font = Font.systemFont(11);
  }
  
  return widget;
}

// Mittleres Widget (4x2)
function createMediumWidget(widget, data) {
  // Header
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  
  const title = headerStack.addText('Meine Aufgaben');
  title.textColor = new Color(COLORS.primary);
  title.font = Font.boldSystemFont(18);
  
  headerStack.addSpacer();
  
  const date = headerStack.addText(formatDate(data.date));
  date.textColor = new Color(COLORS.textSecondary);
  date.font = Font.systemFont(12);
  
  widget.addSpacer(12);
  
  // Statistiken
  const statsStack = widget.addStack();
  statsStack.layoutHorizontally();
  statsStack.spacing = 12;
  
  const totalStat = createStatBox(statsStack, data.total.toString(), 'Aufgaben');
  const completedStat = createStatBox(statsStack, data.completed.toString(), 'Erledigt');
  const hoursStat = createStatBox(statsStack, `${data.remaining.toFixed(1)}h`, 'Verbleibend');
  
  widget.addSpacer(12);
  
  // Wichtigste Todos (max 3)
  const importantTodos = data.todos
    .filter(t => !t.completed)
    .slice(0, 3);
  
  if (importantTodos.length > 0) {
    importantTodos.forEach(todo => {
      const todoStack = widget.addStack();
      todoStack.layoutHorizontally();
      todoStack.spacing = 8;
      
      const icon = todoStack.addText('○');
      icon.textColor = new Color(COLORS.primary);
      icon.font = Font.systemFont(14);
      
      const todoText = todoStack.addText(truncateText(todo.text, 25));
      todoText.textColor = new Color(COLORS.text);
      todoText.font = Font.systemFont(13);
      
      todoStack.addSpacer();
      
      if (todo.planned_hours > 0) {
        const hours = todoStack.addText(`${todo.planned_hours.toFixed(1)}h`);
        hours.textColor = new Color(COLORS.textSecondary);
        hours.font = Font.systemFont(11);
      }
      
      widget.addSpacer(6);
    });
  } else {
    const empty = widget.addText('✓ Alle Aufgaben erledigt!');
    empty.textColor = new Color(COLORS.completed);
    empty.font = Font.systemFont(14);
  }
  
  return widget;
}

// Großes Widget (4x4)
function createLargeWidget(widget, data) {
  // Header
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  
  const title = headerStack.addText('Meine Aufgaben');
  title.textColor = new Color(COLORS.primary);
  title.font = Font.boldSystemFont(20);
  
  headerStack.addSpacer();
  
  const date = headerStack.addText(formatDate(data.date));
  date.textColor = new Color(COLORS.textSecondary);
  date.font = Font.systemFont(13);
  
  widget.addSpacer(12);
  
  // Statistiken
  const statsStack = widget.addStack();
  statsStack.layoutHorizontally();
  statsStack.spacing = 12;
  
  createStatBox(statsStack, data.total.toString(), 'Gesamt');
  createStatBox(statsStack, data.completed.toString(), 'Erledigt');
  createStatBox(statsStack, `${data.remaining.toFixed(1)}h`, 'Verbleibend');
  
  widget.addSpacer(16);
  
  // Alle Todos (max 8)
  const todosToShow = data.todos.slice(0, 8);
  
  todosToShow.forEach(todo => {
    const todoStack = widget.addStack();
    todoStack.layoutHorizontally();
    todoStack.spacing = 10;
    
    // Checkbox
    const icon = todoStack.addText(todo.completed ? '✓' : '○');
    icon.textColor = todo.completed ? new Color(COLORS.completed) : new Color(COLORS.primary);
    icon.font = Font.systemFont(16);
    
    // Todo-Text
    const todoText = todoStack.addText(truncateText(todo.text, 30));
    todoText.textColor = todo.completed ? new Color(COLORS.textSecondary) : new Color(COLORS.text);
    todoText.font = Font.systemFont(14);
    if (todo.completed) {
      todoText.textOpacity = 0.7;
    }
    
    todoStack.addSpacer();
    
    // Stunden
    if (todo.planned_hours > 0) {
      const hoursStack = todoStack.addStack();
      hoursStack.layoutVertically();
      
      const hours = hoursStack.addText(`${todo.used_hours.toFixed(1)}/${todo.planned_hours.toFixed(1)}h`);
      hours.textColor = new Color(COLORS.primary);
      hours.font = Font.systemFont(11);
      
      // Progress bar (visuell)
      const progress = todo.planned_hours > 0 ? (todo.used_hours / todo.planned_hours) * 100 : 0;
      const progressText = hoursStack.addText(`${Math.min(progress, 100).toFixed(0)}%`);
      progressText.textColor = new Color(COLORS.textSecondary);
      progressText.font = Font.systemFont(9);
    }
    
    widget.addSpacer(8);
  });
  
  if (data.todos.length > 8) {
    widget.addSpacer(4);
    const more = widget.addText(`+ ${data.todos.length - 8} weitere...`);
    more.textColor = new Color(COLORS.textSecondary);
    more.font = Font.systemFont(12);
  }
  
  return widget;
}

// ===== HELPER-FUNKTIONEN =====

function createStatBox(stack, value, label) {
  const statStack = stack.addStack();
  statStack.layoutVertically();
  statStack.centerAlignContent();
  
  const valueText = statStack.addText(value);
  valueText.textColor = new Color(COLORS.primary);
  valueText.font = Font.boldSystemFont(20);
  
  const labelText = statStack.addText(label);
  labelText.textColor = new Color(COLORS.textSecondary);
  labelText.font = Font.systemFont(10);
  
  return statStack;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) {
    return 'Heute';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Morgen';
  }
  
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function createErrorWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(COLORS.background);
  widget.setPadding(16, 16, 16, 16);
  
  const error = widget.addText('⚠️ Fehler beim Laden');
  error.textColor = new Color(COLORS.text);
  error.font = Font.systemFont(14);
  
  widget.addSpacer(8);
  
  const hint = widget.addText('Tippe zum Aktualisieren');
  hint.textColor = new Color(COLORS.textSecondary);
  hint.font = Font.systemFont(12);
  
  return widget;
}

function getWidgetConfig() {
  if (typeof config !== 'undefined') {
    return config;
  }
  // Fallback für manuelles Testen
  return { family: 2 }; // Large
}

// ===== WIDGET ERSTELLEN =====
const widget = await createWidget();

// Widget anzeigen (für Vorschau)
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Für Vorschau in der App
  widget.presentSmall();
}

Script.complete();

