import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yzdcfxylvymaybgoetjn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGNmeHlsdnltYXliZ29ldGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTg0NzgsImV4cCI6MjA4MjY3NDQ3OH0.ek5V6ii7cAU5SMk_tIDyYZbWctXvmvEzRCvNYl3C2SE';

const monthsLong = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
];
const dayNamesLong = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag'
];
const monthsShort = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez'
];

export default function TodoPage() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMainSettingsOpen, setIsMainSettingsOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [todoFormState, setTodoFormState] = useState({
    text: '',
    date: todayStr,
    planned_hours: '',
    used_hours: ''
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const supabaseClientRef = useRef(null);
  const calendarSyncIntervalRef = useRef(null);
  const notificationCheckIntervalRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);
  const todosRef = useRef([]);
  const selectedDateRef = useRef(selectedDate);
  const uiStateRef = useRef({
    isTodoModalOpen: false,
    isCalendarSettingsOpen: false,
    editingTodoId: null
  });
  const calendarFileInputRef = useRef(null);
  const datePickerRef = useRef(null);
  const didInitRef = useRef(false);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    uiStateRef.current = {
      isTodoModalOpen,
      isCalendarSettingsOpen,
      editingTodoId
    };
  }, [isTodoModalOpen, isCalendarSettingsOpen, editingTodoId]);

  const initializeSupabase = useCallback(() => {
    try {
      supabaseClientRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase initialized successfully');
    } catch (error) {
      console.warn('Supabase initialization failed, using localStorage only:', error);
    }
  }, []);

  const saveTodoMetadata = useCallback((id, metadata) => {
    try {
      const metadataKey = `todo_metadata_${id}`;
      localStorage.setItem(metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }, []);

  const loadTodoMetadata = useCallback((id) => {
    try {
      const metadataKey = `todo_metadata_${id}`;
      const stored = localStorage.getItem(metadataKey);
      return stored ? JSON.parse(stored) : { description: '', time: '', category: 'home' };
    } catch (error) {
      console.error('Error loading metadata:', error);
      return { description: '', time: '', category: 'home' };
    }
  }, []);

  const checkAutoCompletion = useCallback(
    (loadedTodos) => {
      const updates = loadedTodos.map((todo) => {
        if (!todo.completed && todo.used_hours >= todo.planned_hours && todo.planned_hours > 0) {
          return { ...todo, completed: true };
        }
        return todo;
      });
      setTodos(updates);
      updates.forEach((todo) => {
        if (todo.completed) {
          saveTodo(todo);
        }
      });
    },
    [saveTodo]
  );

  const loadTodos = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      try {
        if (supabaseClientRef.current) {
          const query = supabaseClientRef.current
            .from('todos')
            .select('*')
            .order('date', { ascending: true });

          if (forceRefresh) {
            // Placeholder to mirror old behavior; Supabase queries are fresh by default
          }

          const { data, error } = await query;
          if (error) throw error;

          const mappedTodos = (data || []).map((todo) => {
            const parsedTodo = {
              ...todo,
              planned_hours: parseFloat(todo.planned_hours) || 0,
              used_hours: parseFloat(todo.used_hours) || 0,
              completed: todo.completed || false
            };
            const metadata = loadTodoMetadata(todo.id);
            return { ...parsedTodo, ...metadata };
          });

          setTodos(mappedTodos);
          checkAutoCompletion(mappedTodos);
        } else {
          const stored = localStorage.getItem('todos');
          const localTodos = stored ? JSON.parse(stored) : [];
          setTodos(localTodos);
          checkAutoCompletion(localTodos);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        const stored = localStorage.getItem('todos');
        const localTodos = stored ? JSON.parse(stored) : [];
        setTodos(localTodos);
        checkAutoCompletion(localTodos);
      } finally {
        setIsLoading(false);
      }
    },
    [checkAutoCompletion, loadTodoMetadata]
  );

  async function saveTodo(todo) {
    try {
      if (supabaseClientRef.current) {
        const todoData = {
          text: todo.text,
          date: todo.date,
          planned_hours: parseFloat(todo.planned_hours) || 0,
          used_hours: parseFloat(todo.used_hours) || 0,
          completed: todo.completed || false
        };

        const metadata = {
          description: todo.description || '',
          time: todo.time || '',
          category: todo.category || 'home'
        };

        if (todo.id) {
          const { data, error } = await supabaseClientRef.current
            .from('todos')
            .update(todoData)
            .eq('id', todo.id)
            .select()
            .single();

          if (error) throw error;
          saveTodoMetadata(todo.id, metadata);
          return { ...data, ...metadata };
        }

        const { data, error } = await supabaseClientRef.current
          .from('todos')
          .insert([todoData])
          .select()
          .single();

        if (error) throw error;
        saveTodoMetadata(data.id, metadata);
        return { ...data, ...metadata };
      }

      const localTodos = [...todosRef.current];
      if (todo.id) {
        const index = localTodos.findIndex((t) => t.id === todo.id);
        if (index !== -1) localTodos[index] = { ...localTodos[index], ...todo };
      } else {
        todo.id = Date.now().toString();
        localTodos.push(todo);
      }
      localStorage.setItem('todos', JSON.stringify(localTodos));
      setTodos(localTodos);
      return todo;
    } catch (error) {
      console.error('Error saving todo:', error);
      const localTodos = [...todosRef.current];
      if (todo.id) {
        const index = localTodos.findIndex((t) => t.id === todo.id);
        if (index !== -1) localTodos[index] = { ...localTodos[index], ...todo };
      } else {
        todo.id = Date.now().toString();
        localTodos.push(todo);
      }
      localStorage.setItem('todos', JSON.stringify(localTodos));
      setTodos(localTodos);
      return todo;
    }
  }

  const deleteTodo = useCallback(async (id) => {
    setIsLoading(true);
    try {
      if (supabaseClientRef.current) {
        const { error } = await supabaseClientRef.current.from('todos').delete().eq('id', id);
        if (error) throw error;
      }

      localStorage.removeItem(`todo_metadata_${id}`);
      const next = todosRef.current.filter((t) => t.id !== id);
      localStorage.setItem('todos', JSON.stringify(next));
      setTodos(next);
    } catch (error) {
      console.error('Error deleting todo:', error);
      const next = todosRef.current.filter((t) => t.id !== id);
      localStorage.setItem('todos', JSON.stringify(next));
      setTodos(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTodoComplete = useCallback(
    async (id) => {
      const todo = todosRef.current.find((t) => t.id === id);
      if (!todo) return;
      const updated = { ...todo, completed: !todo.completed };
      await saveTodo(updated);
      await loadTodos(true);
    },
    [loadTodos]
  );

  const openTodoModal = useCallback(
    (todo = null) => {
      setEditingTodoId(todo ? todo.id : null);
      if (todo) {
        setTodoFormState({
          text: todo.text || '',
          date: todo.date || todayStr,
          planned_hours: todo.planned_hours || '',
          used_hours: todo.used_hours || ''
        });
      } else {
        setTodoFormState({
          text: '',
          date: todayStr,
          planned_hours: '',
          used_hours: ''
        });
      }
      setIsTodoModalOpen(true);
    },
    [todayStr]
  );

  const closeTodoModal = useCallback(() => {
    setIsTodoModalOpen(false);
    setEditingTodoId(null);
  }, []);

  const handleTodoSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const todoData = {
        text: todoFormState.text,
        description: '',
        date: todoFormState.date,
        time: '',
        category: 'home',
        planned_hours: parseFloat(todoFormState.planned_hours) || 0,
        used_hours: parseFloat(todoFormState.used_hours) || 0,
        completed: false
      };

      if (editingTodoId) {
        todoData.id = editingTodoId;
        const existingTodo = todosRef.current.find((t) => t.id === editingTodoId);
        if (existingTodo) {
          todoData.description = existingTodo.description || '';
          todoData.time = existingTodo.time || '';
          todoData.category = existingTodo.category || 'home';
        }
      }

      setIsLoading(true);
      try {
        await saveTodo(todoData);
        await loadTodos(true);
        closeTodoModal();
      } catch (error) {
        console.error('Error saving todo:', error);
        alert('Fehler beim Speichern der Aufgabe.');
      } finally {
        setIsLoading(false);
      }
    },
    [closeTodoModal, editingTodoId, loadTodos, todoFormState]
  );

  const navigateDate = useCallback((days) => {
    const currentDate = new Date(`${selectedDateRef.current}T12:00:00`);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  const dateTitle = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (selectedDate === today) return 'Heute';
    if (selectedDate === tomorrowStr) return 'Morgen';
    if (selectedDate === yesterdayStr) return 'Gestern';
    const date = new Date(`${selectedDate}T00:00:00`);
    const dayName = dayNamesLong[date.getDay()];
    const day = date.getDate();
    const month = monthsLong[date.getMonth()];
    return `${dayName}, ${day}. ${month}`;
  }, [selectedDate]);

  const emptyStateText = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (selectedDate === today) return 'Keine Aufgaben für heute';
    if (selectedDate === tomorrowStr) return 'Keine Aufgaben für morgen';
    if (selectedDate === yesterdayStr) return 'Keine Aufgaben für gestern';
    const date = new Date(`${selectedDate}T00:00:00`);
    const day = date.getDate();
    const month = monthsLong[date.getMonth()];
    return `Keine Aufgaben für ${day}. ${month}`;
  }, [selectedDate]);

  const filteredTodos = useMemo(() => {
    const filterDate = selectedDate;
    return todos
      .filter((t) => t && t.date && t.date.split('T')[0] === filterDate)
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });
  }, [selectedDate, todos]);

  function getDateLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) return 'Heute';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Morgen';
    return `${date.getDate()} ${monthsShort[date.getMonth()]}`;
  }

  function formatTime(timeString) {
    return timeString;
  }

  function openDatePicker() {
    setDatePickerVisible(true);
    if (datePickerRef.current && datePickerRef.current.showPicker) {
      datePickerRef.current.showPicker();
    }
  }

  function setDateQuickSelect(selected) {
    if (selected === 'today') {
      setTodoFormState((prev) => ({ ...prev, date: todayStr }));
    } else if (selected === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTodoFormState((prev) => ({
        ...prev,
        date: tomorrow.toISOString().split('T')[0]
      }));
    }
  }

  function normalizeCalendarUrl(url) {
    if (!url) return '';
    return url.replace(/^webcal:\/\//i, 'https://');
  }

  function getCalendarSettings() {
    try {
      const stored = localStorage.getItem('calendarSettings');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    }
    return { url: '', autoSyncEnabled: false };
  }

  function saveCalendarSettings(settings) {
    try {
      localStorage.setItem('calendarSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving calendar settings:', error);
    }
  }

  function loadCalendarSettings() {
    const settings = getCalendarSettings();
    setCalendarUrl(settings.url || '');
    setAutoSyncEnabled(settings.autoSyncEnabled !== false);
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    const settings = { url: calendarUrl.trim(), autoSyncEnabled };
    saveCalendarSettings(settings);

    if (calendarSyncIntervalRef.current) {
      clearInterval(calendarSyncIntervalRef.current);
      calendarSyncIntervalRef.current = null;
    }

    if (settings.autoSyncEnabled && settings.url) {
      await syncCalendarFromUrl();
      startAutoSync();
      alert('Einstellungen gespeichert. Kalender wird automatisch synchronisiert.');
    } else {
      alert('Einstellungen gespeichert.');
    }
    setIsCalendarSettingsOpen(false);
  }

  async function testCalendarConnection() {
    let url = calendarUrl.trim();
    if (!url) {
      alert('Bitte geben Sie eine Kalender-URL ein.');
      return;
    }
    url = normalizeCalendarUrl(url);

    setIsLoading(true);
    try {
      const text = await fetchCalendarWithProxy(url);
      if (!text.includes('BEGIN:VCALENDAR') && !text.includes('BEGIN:VEVENT')) {
        throw new Error('Die URL scheint keine gültige iCal-Datei zu sein.');
      }
      alert('Verbindung erfolgreich! Die Kalender-URL funktioniert.');
    } catch (error) {
      console.error('Connection test failed:', error);
      let errorMessage = error.message;
      if (
        error.message.includes('CORS') ||
        error.message.includes('Failed to fetch') ||
        error.name === 'TypeError'
      ) {
        errorMessage =
          'CORS-Fehler: Der Server erlaubt keine direkten Anfragen von dieser Website. ' +
          'Dies ist ein Sicherheitsfeature des Browsers. ' +
          'Die App versucht automatisch einen CORS-Proxy zu verwenden.';
      }
      alert('Verbindung fehlgeschlagen: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCalendarWithProxy(url) {
    const proxyServices = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
    ];

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/calendar, text/plain, */*'
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 0) return text;
        throw new Error('Empty response from server');
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      const isCorsError =
        error.message.includes('CORS') ||
        error.message.includes('Failed to fetch') ||
        error.name === 'TypeError' ||
        error.message === 'Failed to fetch' ||
        error.message.includes('NetworkError') ||
        error.message.includes('network');

      if (!isCorsError && !error.message.includes('HTTP')) throw error;

      let lastError = null;
      for (let i = 0; i < proxyServices.length; i++) {
        try {
          const proxyUrl = proxyServices[i](url);
          const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });

          if (proxyResponse.ok) {
            const text = await proxyResponse.text();
            if (text && text.length > 0) return text;
            throw new Error('Empty response from proxy');
          }

          throw new Error(`Proxy HTTP ${proxyResponse.status}: ${proxyResponse.statusText}`);
        } catch (proxyError) {
          console.error(`CORS proxy ${i + 1} failed:`, proxyError);
          lastError = proxyError;
        }
      }

      throw new Error(
        'CORS-Fehler: Der Kalender-Server erlaubt keine direkten Anfragen und alle Proxy-Dienste haben versagt. ' +
          'Bitte verwenden Sie einen anderen Kalender-Link oder kontaktieren Sie den Anbieter. ' +
          `Letzter Fehler: ${lastError ? lastError.message : 'Unbekannt'}`
      );
    }
  }

  async function syncCalendarFromUrl() {
    const settings = getCalendarSettings();
    if (!settings.url || !settings.autoSyncEnabled) return;

    try {
      const normalizedUrl = normalizeCalendarUrl(settings.url);
      const text = await fetchCalendarWithProxy(normalizedUrl);
      const events = parseICalFile(text);
      const timeByDateAndTitle = calculateTimeByDateAndTitle(events);

      const todoHoursMap = new Map();
      const targetDate = selectedDateRef.current;

      for (const [date, timeByTitle] of Object.entries(timeByDateAndTitle)) {
        if (date !== targetDate) continue;
        const todosForDate = todosRef.current.filter((t) => t.date?.split('T')[0] === date);

        let unmatchedHours = 0;
        for (const [calendarTitle, hours] of Object.entries(timeByTitle)) {
          const matchedTodo = todosForDate.find((todo) => matchTitle(calendarTitle, todo.text));
          if (matchedTodo) {
            const currentHours = todoHoursMap.get(matchedTodo.id) || 0;
            todoHoursMap.set(matchedTodo.id, currentHours + hours);
          } else {
            unmatchedHours += hours;
          }
        }

        if (unmatchedHours > 0 && todosForDate.length > 0) {
          const hoursPerTodo = unmatchedHours / todosForDate.length;
          todosForDate.forEach((todo) => {
            const currentHours = todoHoursMap.get(todo.id) || 0;
            todoHoursMap.set(todo.id, currentHours + hoursPerTodo);
          });
        }
      }

      const todosToUpdate = [];
      for (const [todoId, totalHours] of todoHoursMap.entries()) {
        const todo = todosRef.current.find((t) => t.id === todoId);
        if (todo) {
          const calendarTime = parseFloat(totalHours.toFixed(2));
          const currentUsedHours = parseFloat(todo.used_hours) || 0;
          if (Math.abs(calendarTime - currentUsedHours) > 0.01) {
            todosToUpdate.push({ ...todo, used_hours: calendarTime });
          }
        }
      }

      for (const todo of todosToUpdate) {
        await saveTodo(todo);
      }

      if (todosToUpdate.length > 0) {
        await loadTodos(true);
      }
    } catch (error) {
      console.error('Error syncing calendar from URL:', error);
    }
  }

  function startAutoSync() {
    if (calendarSyncIntervalRef.current) clearInterval(calendarSyncIntervalRef.current);
    calendarSyncIntervalRef.current = setInterval(async () => {
      await syncCalendarFromUrl();
    }, 5 * 60 * 1000);
  }

  async function handleCalendarImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const events = parseICalFile(text);
      const timeByDateAndTitle = calculateTimeByDateAndTitle(events);
      const today = selectedDateRef.current;

      let updatedCount = 0;
      for (const [date, timeByTitle] of Object.entries(timeByDateAndTitle)) {
        if (date !== today) continue;
        const todosForDate = todosRef.current.filter((t) => t.date?.split('T')[0] === date);

        for (const [calendarTitle, hours] of Object.entries(timeByTitle)) {
          const matchedTodo = todosForDate.find((todo) => matchTitle(calendarTitle, todo.text));
          if (matchedTodo) {
            const currentUsedHours = parseFloat(matchedTodo.used_hours) || 0;
            matchedTodo.used_hours = parseFloat((currentUsedHours + hours).toFixed(2));
            await saveTodo(matchedTodo);
            updatedCount++;
          } else if (todosForDate.length > 0) {
            const hoursPerTodo = hours / todosForDate.length;
            for (const todo of todosForDate) {
              const currentUsedHours = parseFloat(todo.used_hours) || 0;
              todo.used_hours = parseFloat((currentUsedHours + hoursPerTodo).toFixed(2));
              await saveTodo(todo);
              updatedCount++;
            }
          }
        }
      }

      await loadTodos(true);
      event.target.value = '';

      if (updatedCount > 0) {
        alert(`Kalender erfolgreich importiert! ${updatedCount} Aufgabe(n) aktualisiert.`);
      } else {
        alert('Kalender importiert, aber keine passenden Aufgaben für heute gefunden.');
      }
    } catch (error) {
      console.error('Error importing calendar:', error);
      alert('Fehler beim Importieren des Kalenders: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function initializeNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setTimeout(() => {
          checkAndShowDailyNotifications();
        }, 500);
      }
    }
  }

  function startNotificationCheck() {
    if (notificationCheckIntervalRef.current) {
      clearInterval(notificationCheckIntervalRef.current);
    }

    notificationCheckIntervalRef.current = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        checkAndShowDailyNotifications();
      }
    }, 60 * 1000);

    const now = new Date();
    const hour = now.getHours();
    const today = new Date().toISOString().split('T')[0];
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    if (hour >= 8 && lastNotificationDate !== today) {
      setTimeout(() => {
        checkAndShowDailyNotifications();
      }, 1500);
    }
  }

  function checkAndShowDailyNotifications(force = false) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const today = new Date().toISOString().split('T')[0];
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    if (!force && lastNotificationDate === today) return;

    const todayTodos = todosRef.current.filter((todo) => {
      if (!todo?.date) return false;
      return todo.date.split('T')[0] === today && !todo.completed;
    });

    if (todayTodos.length === 0) {
      try {
        const notification = new Notification('Keine Aufgaben für heute', {
          body: 'Du hast heute keine Aufgaben zu erledigen. Gute Arbeit!',
          icon: '/icon-192.png',
          tag: 'daily-tasks-empty',
          requireInteraction: false
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
      if (!force) {
        localStorage.setItem('lastNotificationDate', today);
      }
      return;
    }

    todayTodos.forEach((todo, index) => {
      setTimeout(() => {
        const hours = parseFloat(todo.planned_hours) || 0;
        const hoursText = hours > 0 ? `${hours.toFixed(1)} Stunden` : 'Keine Zeitangabe';
        try {
          const notification = new Notification(`Aufgabe: ${todo.text}`, {
            body: `Geplante Zeit: ${hoursText}`,
            icon: '/icon-192.png',
            tag: `task-${todo.id}`,
            badge: '/icon-192.png',
            requireInteraction: false,
            silent: false
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.error(`Error showing notification for task "${todo.text}":`, error);
        }
      }, index * 500);
    });

    if (!force) {
      localStorage.setItem('lastNotificationDate', today);
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Ihr Browser unterstützt keine Benachrichtigungen.');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      alert(
        'Benachrichtigungen wurden abgelehnt. Bitte aktivieren Sie sie in den Browser-Einstellungen:\n\nChrome: Einstellungen → Datenschutz und Sicherheit → Website-Einstellungen → Benachrichtigungen\nSafari: Einstellungen → Websites → Benachrichtigungen'
      );
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert(
          '✅ Benachrichtigungen aktiviert! Sie erhalten jetzt täglich um 8 Uhr Benachrichtigungen für Ihre Aufgaben.'
        );
        return true;
      }
      if (permission === 'denied') {
        alert(
          'Benachrichtigungen wurden abgelehnt. Sie können sie später in den Browser-Einstellungen aktivieren.'
        );
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Fehler beim Anfordern der Benachrichtigungs-Erlaubnis: ' + error.message);
      return false;
    }
  }

  async function testNotifications() {
    if (!('Notification' in window)) {
      alert('Ihr Browser unterstützt keine Benachrichtigungen.');
      return;
    }
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    checkAndShowDailyNotifications(true);
  }

  function startAutoRefresh() {
    if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    autoRefreshIntervalRef.current = setInterval(async () => {
      const ui = uiStateRef.current;
      if (
        document.visibilityState === 'visible' &&
        !ui.isTodoModalOpen &&
        !ui.isCalendarSettingsOpen &&
        ui.editingTodoId === null
      ) {
        try {
          await loadTodos(true);
        } catch (error) {
          console.error('Error during auto-refresh:', error);
        }
      }
    }, 15 * 1000);

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        try {
          await loadTodos(true);
        } catch (error) {
          console.error('Error refreshing on visibility change:', error);
        }
      }
    });
  }

  function setupServiceWorkerUpdates() {
    if (!('serviceWorker' in navigator)) return;
    setInterval(() => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.update());
      });
    }, 5 * 60 * 1000);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            if (confirm('Eine neue Version der App ist verfügbar. Seite neu laden?')) {
              window.location.reload();
            }
          }
        });
      });
      registration.update();
    });
  }

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      initializeSupabase();
      await loadTodos();
      loadCalendarSettings();
      const settings = getCalendarSettings();
      if (settings.autoSyncEnabled) {
        await syncCalendarFromUrl();
        startAutoSync();
      }
      initializeNotifications();
      startNotificationCheck();
      startAutoRefresh();
      setupServiceWorkerUpdates();
    })();
  }, [initializeSupabase, loadTodos]);

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="date-navigation">
            <button className="date-nav-btn" onClick={() => navigateDate(-1)} title="Vorheriger Tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="date-display">
              <h1 onClick={openDatePicker}>{dateTitle}</h1>
              {datePickerVisible && (
                <input
                  type="date"
                  ref={datePickerRef}
                  id="datePicker"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDatePickerVisible(false);
                  }}
                />
              )}
            </div>
            <button className="date-nav-btn" onClick={() => navigateDate(1)} title="Nächster Tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="header-buttons">
            <Link className="nav-btn" to="/week" title="Wochenplaner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
              </svg>
            </Link>
            <button
              className="settings-btn"
              onClick={() => setIsMainSettingsOpen(true)}
              title="Einstellungen"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {filteredTodos.length === 0 ? (
        <div className="empty-state">
          <p>{emptyStateText}</p>
        </div>
      ) : (
        <div className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodoComplete}
              onDelete={deleteTodo}
              dateLabel={getDateLabel(todo.date)}
              formatTime={formatTime}
              onEdit={() => openTodoModal(todo)}
            />
          ))}
        </div>
      )}

      <button className="add-task-btn" onClick={() => openTodoModal()}>
        <span className="add-icon">+</span>
      </button>

      {isTodoModalOpen && (
        <div className="modal active" onClick={(e) => e.target.classList.contains('modal') && closeTodoModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTodoId ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
              <button className="modal-close" onClick={closeTodoModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleTodoSubmit}>
              <div className="form-group">
                <label htmlFor="todoText">Aufgabe *</label>
                <input
                  id="todoText"
                  type="text"
                  required
                  placeholder="z.B. Einkaufen gehen"
                  value={todoFormState.text}
                  onChange={(e) => setTodoFormState((prev) => ({ ...prev, text: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Datum *</label>
                <div className="date-quick-select">
                  <button
                    type="button"
                    className={`date-btn ${todoFormState.date === todayStr ? 'active' : ''}`}
                    onClick={() => setDateQuickSelect('today')}
                  >
                    Heute
                  </button>
                  <button
                    type="button"
                    className={`date-btn ${
                      todoFormState.date ===
                      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => setDateQuickSelect('tomorrow')}
                  >
                    Morgen
                  </button>
                  <input
                    type="date"
                    value={todoFormState.date}
                    onChange={(e) => setTodoFormState((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="plannedHours">Geplante Stunden (optional)</label>
                <input
                  id="plannedHours"
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="z.B. 2.5"
                  value={todoFormState.planned_hours}
                  onChange={(e) =>
                    setTodoFormState((prev) => ({ ...prev, planned_hours: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="usedHours">Gearbeitete Stunden (optional)</label>
                <input
                  id="usedHours"
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="z.B. 1.5"
                  value={todoFormState.used_hours}
                  onChange={(e) =>
                    setTodoFormState((prev) => ({ ...prev, used_hours: e.target.value }))
                  }
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeTodoModal}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay active">
          <div className="spinner"></div>
        </div>
      )}

      {isMainSettingsOpen && (
        <div className="modal active" onClick={(e) => e.target.classList.contains('modal') && setIsMainSettingsOpen(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Einstellungen</h2>
              <button className="modal-close" onClick={() => setIsMainSettingsOpen(false)}>
                &times;
              </button>
            </div>
            <div className="settings-menu">
              <button
                className="settings-menu-item"
                onClick={() => {
                  setIsMainSettingsOpen(false);
                  testNotifications();
                }}
              >
                <div className="settings-menu-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    <circle cx="12" cy="8" r="1"></circle>
                  </svg>
                </div>
                <div className="settings-menu-content">
                  <div className="settings-menu-title">Benachrichtigungen</div>
                  <div className="settings-menu-description">
                    Benachrichtigungen aktivieren und testen
                  </div>
                </div>
                <svg className="settings-menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button
                className="settings-menu-item"
                onClick={() => {
                  setIsMainSettingsOpen(false);
                  loadCalendarSettings();
                  setIsCalendarSettingsOpen(true);
                }}
              >
                <div className="settings-menu-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                  </svg>
                </div>
                <div className="settings-menu-content">
                  <div className="settings-menu-title">Kalender-Einstellungen</div>
                  <div className="settings-menu-description">
                    Kalender-URL und Auto-Sync konfigurieren
                  </div>
                </div>
                <svg className="settings-menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button
                className="settings-menu-item"
                onClick={() => {
                  setIsMainSettingsOpen(false);
                  calendarFileInputRef.current?.click();
                }}
              >
                <div className="settings-menu-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="M8 14l4 4 4-4"></path>
                  </svg>
                </div>
                <div className="settings-menu-content">
                  <div className="settings-menu-title">Kalender importieren</div>
                  <div className="settings-menu-description">
                    Kalender-Datei (.ics) manuell importieren
                  </div>
                </div>
                <svg className="settings-menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalendarSettingsOpen && (
        <div
          className="modal active"
          onClick={(e) => e.target.classList.contains('modal') && setIsCalendarSettingsOpen(false)}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Kalender-Einstellungen</h2>
              <button className="modal-close" onClick={() => setIsCalendarSettingsOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSettingsSubmit}>
              <div className="form-group">
                <label htmlFor="calendarUrl">Kalender-URL (iCal/CalDAV)</label>
                <input
                  type="url"
                  id="calendarUrl"
                  placeholder="webcal://... oder https://..."
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                />
                <small className="form-hint">
                  Geben Sie die öffentliche iCal-URL Ihres Apple Kalenders ein.
                  <br />
                  Sie finden diese in den Kalender-Einstellungen unter "Teilen" → "Öffentliche URL".
                  <br />
                  <strong>Hinweis:</strong> webcal:// URLs werden automatisch zu https:// konvertiert.
                </small>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  />
                  Automatische Synchronisation aktivieren
                </label>
                <small className="form-hint">
                  Der Kalender wird beim Laden der Seite und alle 5 Minuten automatisch synchronisiert.
                </small>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCalendarSettingsOpen(false)}
                >
                  Abbrechen
                </button>
                <button type="button" className="btn btn-secondary" onClick={testCalendarConnection}>
                  Verbindung testen
                </button>
                <button type="submit" className="btn btn-primary">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={calendarFileInputRef}
        accept=".ics,.ical"
        style={{ display: 'none' }}
        onChange={handleCalendarImport}
      />
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, dateLabel, formatTime, onEdit }) {
  const itemRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const threshold = 80;

  const plannedHours = typeof todo.planned_hours === 'number' ? todo.planned_hours : parseFloat(todo.planned_hours) || 0;
  const usedHours = typeof todo.used_hours === 'number' ? todo.used_hours : parseFloat(todo.used_hours) || 0;
  const progress = plannedHours > 0 ? Math.min(Math.max((usedHours / plannedHours) * 100, 0), 100) : 0;
  const progressClass = progress >= 100 ? 'completed' : progress > 100 ? 'over' : '';

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.touches[0].clientX - startXRef.current;
    if (currentXRef.current < 0 && itemRef.current) {
      itemRef.current.style.setProperty('--swipe-distance', `${currentXRef.current}px`);
      itemRef.current.classList.add('swiping');
    }
  };

  const handleTouchEnd = () => {
    if (currentXRef.current < -threshold) {
      if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
        onDelete(todo.id);
      }
    }
    if (itemRef.current) {
      itemRef.current.style.setProperty('--swipe-distance', '0px');
      itemRef.current.classList.remove('swiping');
    }
    isDraggingRef.current = false;
    currentXRef.current = 0;
  };

  return (
    <div
      ref={itemRef}
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      data-todo-id={todo.id}
      onDoubleClick={onEdit}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="delete-indicator">Löschen</div>
      <div className="todo-checkbox-wrapper">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
      </div>
      <div className="todo-content">
        <div className="todo-title">{todo.text}</div>
        <div className="todo-meta">
          <div className="todo-date">
            <svg className="todo-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{dateLabel}</span>
          </div>
          {todo.time ? <span className="todo-time">{formatTime(todo.time)}</span> : null}
        </div>
        {plannedHours > 0 && (
          <div className="progress-section">
            <div className="progress-info">
              <span>
                {usedHours.toFixed(1)}h / {plannedHours.toFixed(1)}h
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className={`progress-bar ${progressClass}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function parseICalFile(icalText) {
  const events = [];
  const lines = icalText.split(/\r?\n/);
  let currentEvent = null;
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
      line += lines[i + 1].substring(1);
      i++;
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.start && currentEvent.end) {
        events.push(currentEvent);
      }
      inEvent = false;
      currentEvent = null;
    } else if (inEvent && currentEvent) {
      if (line.startsWith('DTSTART')) {
        const dateInfo = extractDateFromLine(line);
        if (dateInfo && dateInfo.dateStr) currentEvent.start = parseICalDate(dateInfo);
      } else if (line.startsWith('DTEND')) {
        const dateInfo = extractDateFromLine(line);
        if (dateInfo && dateInfo.dateStr) currentEvent.end = parseICalDate(dateInfo);
      } else if (line.startsWith('DURATION:')) {
        const durationStr = line.substring(9).trim();
        if (currentEvent.start && !currentEvent.end) {
          currentEvent.end = parseDuration(currentEvent.start, durationStr);
        }
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8).trim();
      }
    }
  }

  return events;
}

function extractDateFromLine(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;

  let dateStr = line.substring(colonIndex + 1);
  const hasZ = dateStr.endsWith('Z');
  const timezoneMatch = dateStr.match(/[+-]\d{4}$/);
  const timezoneOffset = timezoneMatch ? timezoneMatch[0] : null;

  if (hasZ) {
    dateStr = dateStr.replace(/Z$/, '');
  } else if (timezoneOffset) {
    dateStr = dateStr.replace(/[+-]\d{4}$/, '');
  }

  return { dateStr, isUTC: hasZ, timezoneOffset };
}

function parseICalDate(dateInfo) {
  let dateStr;
  let isUTC;
  let timezoneOffset;

  if (typeof dateInfo === 'string') {
    dateStr = dateInfo;
    isUTC = false;
    timezoneOffset = null;
  } else {
    dateStr = dateInfo.dateStr;
    isUTC = dateInfo.isUTC;
    timezoneOffset = dateInfo.timezoneOffset;
  }

  let date;
  if (dateStr.includes('T')) {
    const [datePart, timePart] = dateStr.split('T');
    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10) - 1;
    const day = parseInt(datePart.substring(6, 8), 10);
    const hour = parseInt(timePart.substring(0, 2), 10) || 0;
    const minute = parseInt(timePart.substring(2, 4), 10) || 0;
    const second = parseInt(timePart.substring(4, 6), 10) || 0;

    if (isUTC) {
      date = new Date(Date.UTC(year, month, day, hour, minute, second));
    } else if (timezoneOffset) {
      const sign = timezoneOffset[0] === '+' ? 1 : -1;
      const offsetHours = sign * parseInt(timezoneOffset.substring(1, 3), 10);
      const offsetMinutes = sign * parseInt(timezoneOffset.substring(3, 5), 10);
      const offsetMs = (offsetHours * 60 + offsetMinutes) * 60 * 1000;
      date = new Date(Date.UTC(year, month, day, hour, minute, second) - offsetMs);
    } else {
      date = new Date(year, month, day, hour, minute, second);
    }
  } else {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    date = new Date(year, month, day);
  }

  return date;
}

function parseDuration(startDate, durationStr) {
  if (!durationStr || !durationStr.startsWith('PT')) {
    return null;
  }

  const timePart = durationStr.substring(2);
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const hoursMatch = timePart.match(/(\d+)H/);
  if (hoursMatch) hours = parseInt(hoursMatch[1], 10);

  const minutesMatch = timePart.match(/(\d+)M/);
  if (minutesMatch) minutes = parseInt(minutesMatch[1], 10);

  const secondsMatch = timePart.match(/(\d+)S/);
  if (secondsMatch) seconds = parseInt(secondsMatch[1], 10);

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + hours);
  endDate.setMinutes(endDate.getMinutes() + minutes);
  endDate.setSeconds(endDate.getSeconds() + seconds);
  return endDate;
}

function calculateTimeByDateAndTitle(events) {
  const timeByDateAndTitle = {};

  events.forEach((event) => {
    if (!event.start || !event.end) return;

    const eventDate = new Date(event.start);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const durationMs = event.end.getTime() - event.start.getTime();
    if (durationMs <= 0) return;
    const durationHours = durationMs / (1000 * 60 * 60);

    const eventTitle = (event.summary || 'Unbekannt').trim() || 'Unbekannt';

    if (!timeByDateAndTitle[dateKey]) {
      timeByDateAndTitle[dateKey] = {};
    }
    if (!timeByDateAndTitle[dateKey][eventTitle]) {
      timeByDateAndTitle[dateKey][eventTitle] = 0;
    }
    timeByDateAndTitle[dateKey][eventTitle] += durationHours;
  });

  return timeByDateAndTitle;
}

function matchTitle(calendarTitle, todoTitle) {
  if (!calendarTitle || !todoTitle) return false;
  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const calNorm = normalize(calendarTitle);
  const todoNorm = normalize(todoTitle);

  if (calNorm === todoNorm) return true;
  if (calNorm.includes(todoNorm) || todoNorm.includes(calNorm)) return true;

  const calWords = calNorm.split(/\s+/);
  const todoWords = todoNorm.split(/\s+/);
  const matchingWords = calWords.filter((word) =>
    todoWords.some((todoWord) => word === todoWord || word.includes(todoWord) || todoWord.includes(word))
  );

  return calWords.length > 0 && matchingWords.length / calWords.length >= 0.5;
}

