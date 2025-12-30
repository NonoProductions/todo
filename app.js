// Supabase Configuration
const SUPABASE_URL = 'https://yzdcfxylvymaybgoetjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGNmeHlsdnltYXliZ29ldGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTg0NzgsImV4cCI6MjA4MjY3NDQ3OH0.ek5V6ii7cAU5SMk_tIDyYZbWctXvmvEzRCvNYl3C2SE';

// Initialize Supabase Client
let supabaseClient = null;

function initializeSupabase() {
    try {
        // Check if supabase is available (from CDN)
        // Try multiple ways to access supabase
        const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
        
        if (supabaseLib && typeof supabaseLib.createClient === 'function') {
            supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized successfully');
        } else {
            console.warn('Supabase library not loaded, using localStorage only');
            console.log('Available:', { 
                windowSupabase: typeof window.supabase, 
                globalSupabase: typeof supabase !== 'undefined' 
            });
        }
    } catch (error) {
        console.warn('Supabase initialization failed, using localStorage only:', error);
    }
}

// State Management
let todos = [];
let editingTodoId = null;

// DOM Elements
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const todoModal = document.getElementById('todoModal');
const todoForm = document.getElementById('todoForm');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initializeSupabase();
    await loadTodos();
    setupEventListeners();
    renderTodos();
});

// Event Listeners Setup
function setupEventListeners() {
    // Modal Controls
    document.getElementById('addTodoBtn').addEventListener('click', () => openTodoModal());
    document.getElementById('closeModal').addEventListener('click', closeTodoModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTodoModal);
    
    // Date quick select buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dateType = e.target.dataset.date;
            setDateQuickSelect(dateType);
        });
    });
    
    // Form Submission
    todoForm.addEventListener('submit', handleTodoSubmit);
    
    // Close modal on outside click
    todoModal.addEventListener('click', (e) => {
        if (e.target === todoModal) closeTodoModal();
    });
}

// Todo CRUD Operations
async function loadTodos() {
    showLoading();
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('todos')
                .select('*')
                .order('date', { ascending: true });
            
            if (error) throw error;
            todos = (data || []).map(todo => {
                // Load metadata from localStorage
                const metadata = loadTodoMetadata(todo.id);
                return { ...todo, ...metadata };
            });
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem('todos');
            todos = stored ? JSON.parse(stored) : [];
        }
        
        // Check for automatic completion
        checkAutoCompletion();
    } catch (error) {
        console.error('Error loading todos:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('todos');
        todos = stored ? JSON.parse(stored) : [];
    } finally {
        hideLoading();
    }
}

async function saveTodo(todo) {
    try {
        if (supabaseClient) {
            // Prepare data object with only the columns that exist in the database
            const todoData = {
                text: todo.text,
                date: todo.date,
                planned_hours: parseFloat(todo.planned_hours) || 0,
                used_hours: parseFloat(todo.used_hours) || 0,
                completed: todo.completed || false
            };
            
            // Store additional fields in localStorage metadata
            const metadata = {
                description: todo.description || '',
                time: todo.time || '',
                category: todo.category || 'home'
            };
            
            if (todo.id) {
                // Update existing todo
                const { data, error } = await supabaseClient
                    .from('todos')
                    .update(todoData)
                    .eq('id', todo.id)
                    .select()
                    .single();
                
                if (error) throw error;
                // Merge metadata
                const result = { ...data, ...metadata };
                saveTodoMetadata(todo.id, metadata);
                return result;
            } else {
                // Insert new todo
                const { data, error } = await supabaseClient
                    .from('todos')
                    .insert([todoData])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Supabase insert error:', error);
                    throw error;
                }
                // Merge metadata
                const result = { ...data, ...metadata };
                saveTodoMetadata(data.id, metadata);
                return result;
            }
        } else {
            // Fallback to localStorage
            if (todo.id) {
                const index = todos.findIndex(t => t.id === todo.id);
                if (index !== -1) {
                    todos[index] = { ...todos[index], ...todo };
                }
            } else {
                todo.id = Date.now().toString();
                todos.push(todo);
            }
            localStorage.setItem('todos', JSON.stringify(todos));
            return todo;
        }
    } catch (error) {
        console.error('Error saving todo:', error);
        // Fallback to localStorage
        if (todo.id) {
            const index = todos.findIndex(t => t.id === todo.id);
            if (index !== -1) {
                todos[index] = { ...todos[index], ...todo };
            }
        } else {
            todo.id = Date.now().toString();
            todos.push(todo);
        }
        localStorage.setItem('todos', JSON.stringify(todos));
        return todo;
    }
}

function saveTodoMetadata(id, metadata) {
    try {
        const metadataKey = `todo_metadata_${id}`;
        localStorage.setItem(metadataKey, JSON.stringify(metadata));
    } catch (error) {
        console.error('Error saving metadata:', error);
    }
}

function loadTodoMetadata(id) {
    try {
        const metadataKey = `todo_metadata_${id}`;
        const stored = localStorage.getItem(metadataKey);
        return stored ? JSON.parse(stored) : { description: '', time: '', category: 'home' };
    } catch (error) {
        console.error('Error loading metadata:', error);
        return { description: '', time: '', category: 'home' };
    }
}

async function deleteTodo(id) {
    showLoading();
    try {
        if (supabaseClient) {
            const { error } = await supabaseClient
                .from('todos')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
        }
        
        // Remove metadata
        try {
            localStorage.removeItem(`todo_metadata_${id}`);
        } catch (e) {
            console.error('Error removing metadata:', e);
        }
        
        todos = todos.filter(t => t.id !== id);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        todos = todos.filter(t => t.id !== id);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    } finally {
        hideLoading();
    }
}

async function toggleTodoComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    todo.completed = !todo.completed;
    await saveTodo(todo);
    renderTodos();
}

function checkAutoCompletion() {
    todos.forEach(todo => {
        if (!todo.completed && todo.used_hours >= todo.planned_hours && todo.planned_hours > 0) {
            todo.completed = true;
            saveTodo(todo);
        }
    });
}


// UI Functions
function openTodoModal(todo = null) {
    editingTodoId = todo ? todo.id : null;
    document.getElementById('modalTitle').textContent = todo ? 'Aufgabe bearbeiten' : 'Neue Aufgabe';
    document.getElementById('todoText').value = todo ? todo.text : '';
    document.getElementById('plannedHours').value = todo ? (todo.planned_hours || '') : '';
    
    // Set date and quick select buttons
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (todo) {
        document.getElementById('todoDate').value = todo.date;
        // Check if date matches today or tomorrow
        if (todo.date === today) {
            setDateQuickSelect('today');
        } else if (todo.date === tomorrowStr) {
            setDateQuickSelect('tomorrow');
        } else {
            setDateQuickSelect(null);
            // Show date input for custom dates
            document.getElementById('todoDate').style.display = 'block';
        }
    } else {
        // Default to today
        document.getElementById('todoDate').value = today;
        setDateQuickSelect('today');
    }
    
    todoModal.classList.add('active');
}

function setDateQuickSelect(selected) {
    // Remove active class from all buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (selected === 'today') {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('todoDate').value = today;
        document.querySelector('.date-btn[data-date="today"]').classList.add('active');
        document.getElementById('todoDate').style.display = 'none';
    } else if (selected === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        document.getElementById('todoDate').value = tomorrowStr;
        document.querySelector('.date-btn[data-date="tomorrow"]').classList.add('active');
        document.getElementById('todoDate').style.display = 'none';
    } else {
        document.getElementById('todoDate').style.display = 'block';
    }
}

function closeTodoModal() {
    todoModal.classList.remove('active');
    todoForm.reset();
    editingTodoId = null;
}

async function handleTodoSubmit(e) {
    e.preventDefault();
    
    const todoData = {
        text: document.getElementById('todoText').value,
        description: '', // Keep for compatibility but not shown in UI
        date: document.getElementById('todoDate').value,
        time: '', // Keep for compatibility but not shown in UI
        category: 'home', // Keep for compatibility but not shown in UI
        planned_hours: parseFloat(document.getElementById('plannedHours').value) || 0,
        used_hours: 0,
        completed: false
    };
    
    if (editingTodoId) {
        todoData.id = editingTodoId;
        // Preserve existing values when editing
        const existingTodo = todos.find(t => t.id === editingTodoId);
        if (existingTodo) {
            todoData.description = existingTodo.description || '';
            todoData.time = existingTodo.time || '';
            todoData.category = existingTodo.category || 'home';
            todoData.used_hours = existingTodo.used_hours || 0;
        }
    }
    
    showLoading();
    try {
        await saveTodo(todoData);
        await loadTodos();
        renderTodos();
        closeTodoModal();
    } catch (error) {
        console.error('Error saving todo:', error);
        alert('Fehler beim Speichern der Aufgabe.');
    } finally {
        hideLoading();
    }
}

function renderTodos() {
    // Filter for today's tasks
    const today = new Date().toISOString().split('T')[0];
    const todayTodos = todos.filter(t => t.date === today);
    
    // Sort by time if available, then by creation
    todayTodos.sort((a, b) => {
        if (a.time && b.time) {
            return a.time.localeCompare(b.time);
        }
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
    });
    
    if (todayTodos.length === 0) {
        todoList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    todoList.style.display = 'flex';
    emptyState.style.display = 'none';
    todoList.innerHTML = '';
    
    todayTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.dataset.todoId = todo.id;
    
    const time = todo.time || '';
    const dateLabel = getDateLabel(todo.date);
    const plannedHours = parseFloat(todo.planned_hours) || 0;
    const usedHours = parseFloat(todo.used_hours) || 0;
    const progress = plannedHours > 0 ? Math.min((usedHours / plannedHours) * 100, 100) : 0;
    const progressClass = progress >= 100 ? 'completed' : progress > 100 ? 'over' : '';
    
    div.innerHTML = `
        <div class="delete-indicator">Löschen</div>
        <div class="todo-checkbox-wrapper">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodoComplete('${todo.id}')">
        </div>
        <div class="todo-content">
            <div class="todo-title">${escapeHtml(todo.text)}</div>
            <div class="todo-meta">
                <div class="todo-date">
                    <svg class="todo-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${dateLabel}</span>
                </div>
                ${time ? `<span class="todo-time">${formatTime(time)}</span>` : ''}
            </div>
            ${plannedHours > 0 ? `
                <div class="progress-section">
                    <div class="progress-info">
                        <span>${usedHours.toFixed(1)}h / ${plannedHours.toFixed(1)}h</span>
                        <span>${progress.toFixed(0)}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${progressClass}" style="width: ${progress}%"></div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add swipe to delete
    setupSwipeToDelete(div, todo.id);
    
    return div;
}

function getDateLabel(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
        return 'Heute';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
        return 'Morgen';
    } else {
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }
}

function formatTime(timeString) {
    // timeString is in format "HH:MM"
    return timeString;
}

function setupSwipeToDelete(element, todoId) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 80;
    
    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    element.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX - startX;
        
        if (currentX < 0) {
            element.style.setProperty('--swipe-distance', `${currentX}px`);
            element.classList.add('swiping');
        }
    });
    
    element.addEventListener('touchend', () => {
        if (currentX < -threshold) {
            confirmDelete(todoId);
        }
        element.style.setProperty('--swipe-distance', '0px');
        element.classList.remove('swiping');
        isDragging = false;
        currentX = 0;
    });
}

function confirmDelete(id) {
    if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
        deleteTodo(id);
    }
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Make functions globally available for inline event handlers
window.toggleTodoComplete = toggleTodoComplete;
window.confirmDelete = confirmDelete;
