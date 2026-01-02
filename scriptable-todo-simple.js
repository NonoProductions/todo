// Scriptable Widget - Einfache Version
// Perfekt für den Einstieg - zeigt nur die wichtigsten Informationen

// ===== KONFIGURATION =====
// ÄNDERE DIESE URL ZU DEINER DOMAIN!
const WIDGET_API_URL = 'https://deine-domain.de/widget-api.html';

// ===== HAUPTFUNKTION =====
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color('#1a1a1a');
  widget.setPadding(16, 16, 16, 16);
  
  // Daten laden
  let data;
  try {
    const req = new Request(WIDGET_API_URL);
    data = await req.loadJSON();
  } catch (error) {
    // Fehler-Widget
    const errorText = widget.addText('⚠️ Fehler beim Laden');
    errorText.textColor = Color.white();
    Script.setWidget(widget);
    Script.complete();
    return;
  }
  
  // Titel
  const title = widget.addText('📝 Meine Aufgaben');
  title.textColor = new Color('#4a9eff');
  title.font = Font.boldSystemFont(18);
  
  widget.addSpacer(12);
  
  // Statistiken
  const statsText = widget.addText(`${data.completed} von ${data.total} erledigt`);
  statsText.textColor = Color.white();
  statsText.font = Font.systemFont(16);
  
  widget.addSpacer(8);
  
  // Verbleibende Stunden
  if (data.remaining > 0) {
    const hoursText = widget.addText(`⏱️ ${data.remaining.toFixed(1)}h verbleibend`);
    hoursText.textColor = new Color('#4a9eff');
    hoursText.font = Font.systemFont(14);
  } else {
    const doneText = widget.addText('✅ Alles erledigt!');
    doneText.textColor = new Color('#6bcf7f');
    doneText.font = Font.systemFont(14);
  }
  
  widget.addSpacer(12);
  
  // Wichtigste offene Aufgaben (max 5)
  const openTodos = data.todos.filter(t => !t.completed).slice(0, 5);
  
  if (openTodos.length > 0) {
    openTodos.forEach(todo => {
      const todoStack = widget.addStack();
      todoStack.layoutHorizontally();
      todoStack.spacing = 8;
      
      const icon = todoStack.addText('○');
      icon.textColor = new Color('#4a9eff');
      icon.font = Font.systemFont(14);
      
      const todoText = todoStack.addText(todo.text.length > 30 ? todo.text.substring(0, 27) + '...' : todo.text);
      todoText.textColor = Color.white();
      todoText.font = Font.systemFont(13);
      
      widget.addSpacer(6);
    });
  }
  
  Script.setWidget(widget);
  Script.complete();
}

// Widget erstellen
await createWidget();

