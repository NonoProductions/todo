import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const monthsShort = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
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

const startHour = 15;
const endHour = 24;
const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

export default function WeekPage() {
  const [weekStartDate, setWeekStartDate] = useState(getWeekStart(new Date()));
  const [activeTask, setActiveTask] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [nowLineStyle, setNowLineStyle] = useState(null);
  const weekGridRef = useRef(null);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const tasks = useMemo(() => loadWeekTasks(), []);
  const [taskState, setTaskState] = useState(tasks);

  const weekDates = useMemo(() => getWeekDates(weekStartDate), [weekStartDate]);
  const weekRange = useMemo(() => formatWeekRange(weekStartDate), [weekStartDate]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const isTodayInWeek = useMemo(
    () => weekDates.some((date) => formatDateKey(date) === todayKey),
    [todayKey, weekDates]
  );

  useEffect(() => {
    const container = weekGridRef.current;
    if (!container) return;

    const updateNowLine = () => {
      const now = new Date();
      const todayKey = formatDateKey(now);
      const isTodayInWeek = weekDates.some((date) => formatDateKey(date) === todayKey);
      if (!isTodayInWeek) {
        setNowLineStyle(null);
        return;
      }

      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinutes;
      if (totalMinutesFromStart < 0 || totalMinutesFromStart > (endHour - startHour) * 60) {
        setNowLineStyle(null);
        return;
      }

      const headerRow = container.querySelector('.week-row-header');
      const dataRow = container.querySelector('.week-row:not(.week-row-header)');
      if (!headerRow || !dataRow) return;

      const headerHeight = headerRow.getBoundingClientRect().height;
      const rowHeight = dataRow.getBoundingClientRect().height;
      const top = headerHeight + (totalMinutesFromStart / 60) * rowHeight;
      const left = 0;
      const width = Math.max(container.clientWidth, container.scrollWidth);

      setNowLineStyle({
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`
      });
    };

    updateNowLine();
    const interval = setInterval(updateNowLine, 60 * 1000);
    window.addEventListener('resize', updateNowLine);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateNowLine);
    };
  }, [weekDates]);

  useEffect(() => {
    if (!isTodayInWeek) return;
    if (!window.matchMedia('(max-width: 480px)').matches) return;

    const scrollToTarget = () => {
      const grid = weekGridRef.current;
      if (grid) {
        const headerCell = grid.querySelector(`.week-cell-header[data-date="${todayKey}"]`);
        if (headerCell) {
          const targetLeft =
            headerCell.offsetLeft +
            headerCell.offsetWidth / 2 -
            grid.clientWidth / 2;
          grid.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
        }
      }

      const now = new Date();
      const currentHour = Math.min(Math.max(now.getHours(), startHour), endHour);
      const targetRow = weekGridRef.current?.querySelector(
        `.week-row[data-hour="${currentHour}"]`
      );
      const nowLine = weekGridRef.current?.querySelector('.now-line');
      const target = nowLine || targetRow;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const targetCenter = rect.top + window.scrollY + rect.height / 2;
      const desiredTop = Math.max(0, targetCenter - window.innerHeight / 2);
      window.scrollTo({ top: desiredTop, behavior: 'smooth' });
    };

    const timer = setTimeout(scrollToTarget, 80);
    const timer2 = setTimeout(scrollToTarget, 300);
    const handleResize = () => scrollToTarget();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTodayInWeek, todayKey, weekDates, weekStartDate, nowLineStyle]);

  const openTaskModal = (dateStr, taskIndex = null, task = null) => {
    setActiveTask({ dateStr, taskIndex });
    if (task) {
      setTaskInput(task.text || (typeof task === 'string' ? task : ''));
      setStartTime(task.startTime || '');
      setEndTime(task.endTime || '');
    } else {
      setTaskInput('');
      setStartTime('');
      setEndTime('');
    }
  };

  const closeTaskModal = () => {
    setActiveTask(null);
    setTaskInput('');
    setStartTime('');
    setEndTime('');
  };

  const saveTask = (e) => {
    e.preventDefault();
    if (!activeTask) return;
    const trimmed = taskInput.trim();
    const next = { ...(taskState || {}) };
    if (!next[activeTask.dateStr]) next[activeTask.dateStr] = [];

    if (!trimmed) {
      // Delete task
      if (activeTask.taskIndex !== null) {
        next[activeTask.dateStr].splice(activeTask.taskIndex, 1);
        if (next[activeTask.dateStr].length === 0) {
          delete next[activeTask.dateStr];
        }
      }
    } else {
      // Add or update task
      const taskData = {
        text: trimmed,
        startTime: startTime.trim() || null,
        endTime: endTime.trim() || null
      };
      if (activeTask.taskIndex !== null) {
        next[activeTask.dateStr][activeTask.taskIndex] = taskData;
      } else {
        next[activeTask.dateStr].push(taskData);
      }
    }
    setTaskState(next);
    localStorage.setItem('weekPlannerTasks', JSON.stringify(next));
    closeTaskModal();
  };

  const deleteTask = () => {
    if (!activeTask || activeTask.taskIndex === null) return;
    const next = { ...(taskState || {}) };
    if (next[activeTask.dateStr]) {
      next[activeTask.dateStr].splice(activeTask.taskIndex, 1);
      if (next[activeTask.dateStr].length === 0) {
        delete next[activeTask.dateStr];
      }
      setTaskState(next);
      localStorage.setItem('weekPlannerTasks', JSON.stringify(next));
    }
    closeTaskModal();
  };

  const getTasksForDate = (dateStr) => {
    return taskState?.[dateStr] || [];
  };

  const getTasksForHour = (dateStr, hour) => {
    const tasks = getTasksForDate(dateStr);
    return tasks.filter(task => {
      const taskObj = typeof task === 'string' ? { text: task } : task;
      if (!taskObj.startTime && !taskObj.endTime) return false;
      const start = parseTime(taskObj.startTime);
      const end = parseTime(taskObj.endTime);
      if (start === null && end === null) return false;
      if (start !== null && end !== null) {
        // Show task only in the first hour of its time range
        return hour === start;
      }
      if (start !== null) return hour === start;
      if (end !== null) return hour === 0; // Show at start if only end time
      return false;
    });
  };

  const getTaskSpan = (task) => {
    const taskObj = typeof task === 'string' ? { text: task } : task;
    if (!taskObj.startTime && !taskObj.endTime) return 1;
    const start = parseTime(taskObj.startTime);
    const end = parseTime(taskObj.endTime);
    if (start !== null && end !== null) {
      return Math.max(1, end - start);
    }
    return 1;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const hour = parseInt(parts[0], 10);
    if (isNaN(hour) || hour < 0 || hour > 23) return null;
    return hour;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };


  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="header-spacer"></div>
          <div className="week-page-title">
            <h1>Wochenplaner</h1>
          </div>
          <div className="header-buttons">
            <Link className="nav-btn" to="/" title="Zur Todo-Liste">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="week-planner-page">
        <div className="week-planner-header">
          <button
            className="week-nav-btn"
            onClick={() => setWeekStartDate(getWeekStart(addDays(weekStartDate, -7)))}
            title="Vorherige Woche"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="week-range">{weekRange}</div>
          <div className="week-header-actions">
            <button
              className="week-nav-btn"
              onClick={() => setWeekStartDate(getWeekStart(addDays(weekStartDate, 7)))}
              title="Nächste Woche"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="week-grid" ref={weekGridRef}>
          <div className="week-row week-row-header">
            <div className="week-cell week-cell-time"></div>
            {weekDates.map((date) => {
              const dateStr = formatDateKey(date);
              const isToday = dateStr === todayStr;
              return (
                <div
                  className={`week-cell week-cell-header ${isToday ? 'today' : ''}`}
                  data-date={dateStr}
                  key={date.toISOString()}
                >
                  {formatDayHeader(date)}
                </div>
              );
            })}
          </div>

          {hours.map((hour) => {
            const timeLabel = hour === 24 ? '00:00' : `${String(hour).padStart(2, '0')}:00`;
            return (
              <div className="week-row" data-hour={hour} key={hour}>
                <div className="week-cell week-cell-time">{timeLabel}</div>
                {weekDates.map((date) => {
                  const dateStr = formatDateKey(date);
                  const tasksForHour = getTasksForHour(dateStr, hour);
                  const allTasks = getTasksForDate(dateStr);
                  const tasksWithoutTime = allTasks.filter(task => {
                    const taskObj = typeof task === 'string' ? { text: task } : task;
                    return !taskObj.startTime && !taskObj.endTime;
                  });

                  return (
                    <div key={`${dateStr}-${hour}`} className="week-cell week-slot-container">
                      {hour === startHour && (
                        <>
                          {tasksWithoutTime.map((task, index) => {
                            const taskObj = typeof task === 'string' ? { text: task } : task;
                            return (
                              <button
                                key={`no-time-${index}`}
                                className="week-task-item week-task-no-time"
                                onClick={() => {
                                  const taskIndex = allTasks.findIndex(t => t === task);
                                  openTaskModal(dateStr, taskIndex, taskObj);
                                }}
                              >
                                {taskObj.text}
                              </button>
                            );
                          })}
                          <button
                            className="week-task-add"
                            onClick={() => openTaskModal(dateStr, null, null)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </>
                      )}
                      {tasksForHour.map((task, index) => {
                        const taskObj = typeof task === 'string' ? { text: task } : task;
                        const taskIndex = allTasks.findIndex(t => t === task);
                        const start = parseTime(taskObj.startTime);
                        const end = parseTime(taskObj.endTime);
                        const span = start !== null && end !== null ? Math.max(1, end - start) : 1;
                        return (
                          <button
                            key={`${hour}-${index}`}
                            className="week-task-item week-task-timed"
                            onClick={() => openTaskModal(dateStr, taskIndex, taskObj)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '0px',
                              right: '4px',
                              height: `calc(${span} * 48px - 8px)`,
                              minHeight: '40px',
                              zIndex: 2
                            }}
                          >
                            <div className="week-task-text">{taskObj.text}</div>
                            {(taskObj.startTime || taskObj.endTime) && (
                              <div className="week-task-time">
                                {taskObj.startTime && formatTime(taskObj.startTime)}
                                {taskObj.startTime && taskObj.endTime && ' - '}
                                {taskObj.endTime && formatTime(taskObj.endTime)}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {nowLineStyle && (
            <div className="now-line" style={nowLineStyle}>
              <span className="now-line-dot"></span>
            </div>
          )}
        </div>
      </div>

      {activeTask && (
        <div className="modal active" onClick={(e) => e.target.classList.contains('modal') && closeTaskModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formatDateTitle(activeTask.dateStr)}</h2>
              <button className="modal-close" onClick={closeTaskModal}>
                &times;
              </button>
            </div>
            <form onSubmit={saveTask}>
              <div className="form-group">
                <label htmlFor="weekTaskText">Aufgabe</label>
                <input
                  id="weekTaskText"
                  type="text"
                  placeholder="z.B. Bericht schreiben"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Startzeit (optional)</label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">Endzeit (optional)</label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div className="form-actions">
                {activeTask.taskIndex !== null && (
                  <button type="button" className="btn btn-secondary" onClick={deleteTask}>
                    Löschen
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getWeekStart(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekDates(startDate) {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
}

function formatWeekRange(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startDay = weekStart.getDate();
  const endDay = end.getDate();
  const startMonth = monthsShort[weekStart.getMonth()];
  const endMonth = monthsShort[end.getMonth()];

  if (weekStart.getMonth() === end.getMonth()) {
    return `${startDay}.–${endDay}. ${startMonth}`;
  }
  return `${startDay}. ${startMonth} – ${endDay}. ${endMonth}`;
}

function formatDayHeader(date) {
  const dayIndex = (date.getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.getTime() === today.getTime();
  return (
    <div className={`week-day-header ${isToday ? 'today' : ''}`}>
      <span className="week-day-name">{dayNames[dayIndex]}</span>
      <span className="week-day-number">{date.getDate()}</span>
    </div>
  );
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTitle(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  const dayName = dayNamesLong[date.getDay()];
  return `${dayName}, ${date.getDate()}. ${monthsLong[date.getMonth()]}`;
}

function loadWeekTasks() {
  try {
    const stored = localStorage.getItem('weekPlannerTasks');
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    // Migrate old formats to new format
    const migrated = {};
    for (const [date, tasks] of Object.entries(parsed)) {
      if (Array.isArray(tasks)) {
        // Migrate string tasks to objects
        migrated[date] = tasks.map(task => {
          if (typeof task === 'string') {
            return { text: task, startTime: null, endTime: null };
          }
          return task;
        });
      } else if (typeof tasks === 'object') {
        // Old format: {hour: task}
        migrated[date] = Object.entries(tasks)
          .map(([hour, task]) => {
            if (typeof task === 'string' && task.trim()) {
              return {
                text: task,
                startTime: `${String(parseInt(hour, 10)).padStart(2, '0')}:00`,
                endTime: `${String(parseInt(hour, 10) + 1).padStart(2, '0')}:00`
              };
            }
            return null;
          })
          .filter(t => t !== null);
      }
    }
    return migrated;
  } catch (error) {
    console.error('Error loading week planner tasks:', error);
    return {};
  }
}

