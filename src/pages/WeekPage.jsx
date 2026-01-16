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

const startHour = 8;
const endHour = 24;

export default function WeekPage() {
  const [weekStartDate, setWeekStartDate] = useState(getWeekStart(new Date()));
  const [activeSlot, setActiveSlot] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const weekGridRef = useRef(null);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const tasks = useMemo(() => loadWeekTasks(), []);
  const [taskState, setTaskState] = useState(tasks);

  const weekDates = useMemo(() => getWeekDates(weekStartDate), [weekStartDate]);
  const weekRange = useMemo(() => formatWeekRange(weekStartDate), [weekStartDate]);

  const openSlot = (dateStr, hour) => {
    const existing = taskState?.[dateStr]?.[hour] || '';
    setActiveSlot({ dateStr, hour });
    setTaskInput(existing);
  };

  const closeSlot = () => {
    setActiveSlot(null);
    setTaskInput('');
  };

  const saveSlot = (e) => {
    e.preventDefault();
    if (!activeSlot) return;
    const trimmed = taskInput.trim();
    const next = { ...(taskState || {}) };
    if (!next[activeSlot.dateStr]) next[activeSlot.dateStr] = {};

    if (!trimmed) {
      delete next[activeSlot.dateStr][activeSlot.hour];
      if (Object.keys(next[activeSlot.dateStr]).length === 0) {
        delete next[activeSlot.dateStr];
      }
    } else {
      next[activeSlot.dateStr][activeSlot.hour] = trimmed;
    }
    setTaskState(next);
    localStorage.setItem('weekPlannerTasks', JSON.stringify(next));
    closeSlot();
  };

  const deleteSlot = () => {
    if (!activeSlot) return;
    const next = { ...(taskState || {}) };
    if (next[activeSlot.dateStr]) {
      delete next[activeSlot.dateStr][activeSlot.hour];
      if (Object.keys(next[activeSlot.dateStr]).length === 0) {
        delete next[activeSlot.dateStr];
      }
      setTaskState(next);
      localStorage.setItem('weekPlannerTasks', JSON.stringify(next));
    }
    closeSlot();
  };

  const centerTodayInMobile = useCallback(() => {
    const container = weekGridRef.current;
    if (!container) return;
    if (!window.matchMedia('(max-width: 480px)').matches) return;
    if (!weekDates.some((date) => formatDateKey(date) === todayStr)) return;

    const headerCell = container.querySelector(
      `.week-cell-header[data-date="${todayStr}"]`
    );
    if (!headerCell) return;

    const containerRect = container.getBoundingClientRect();
    const cellRect = headerCell.getBoundingClientRect();
    if (!containerRect.width || !cellRect.width) return;

    const currentScroll = container.scrollLeft;
    const offsetLeft = cellRect.left - containerRect.left;
    const targetScroll =
      currentScroll + offsetLeft + cellRect.width / 2 - containerRect.width / 2;
    container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }, [todayStr, weekDates]);

  useEffect(() => {
    let frame1;
    let frame2;
    const runCentering = () => {
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => centerTodayInMobile());
      });
    };

    runCentering();
    const delayed = setTimeout(centerTodayInMobile, 200);
    const handleResize = () => centerTodayInMobile();
    window.addEventListener('resize', handleResize);

    const container = weekGridRef.current;
    let resizeObserver;
    if (container && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => centerTodayInMobile());
      resizeObserver.observe(container);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => centerTodayInMobile());
    }

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      clearTimeout(delayed);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [centerTodayInMobile]);

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
              const label = formatDayHeader(date);
              return (
                <div
                  className="week-cell week-cell-header"
                  data-date={formatDateKey(date)}
                  key={date.toISOString()}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {Array.from({ length: endHour - startHour + 1 }).map((_, index) => {
            const hour = startHour + index;
            const displayHour = hour === 24 ? 0 : hour;
            const timeLabel = `${String(displayHour).padStart(2, '0')}:00`;
            return (
              <div className="week-row" key={hour}>
                <div className="week-cell week-cell-time">{timeLabel}</div>
                {weekDates.map((date) => {
                  const dateStr = formatDateKey(date);
                  const task = taskState?.[dateStr]?.[hour] || '';
                  return (
                    <button
                      key={`${dateStr}-${hour}`}
                      className={`week-cell week-slot ${task ? 'has-task' : ''}`}
                      onClick={() => openSlot(dateStr, hour)}
                    >
                      {task}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {activeSlot && (
        <div className="modal active" onClick={(e) => e.target.classList.contains('modal') && closeSlot()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {formatDateTitle(activeSlot.dateStr)} • {String(activeSlot.hour === 24 ? 0 : activeSlot.hour).padStart(2, '0')}
                :00
              </h2>
              <button className="modal-close" onClick={closeSlot}>
                &times;
              </button>
            </div>
            <form onSubmit={saveSlot}>
              <div className="form-group">
                <label htmlFor="weekTaskText">Aufgabe für diese Stunde</label>
                <input
                  id="weekTaskText"
                  type="text"
                  placeholder="z.B. Bericht schreiben"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={deleteSlot}>
                  Löschen
                </button>
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
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading week planner tasks:', error);
    return {};
  }
}

