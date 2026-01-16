let weekStartDate = getWeekStart(new Date());
let activeSlot = null;

const weekGrid = document.getElementById('weekGrid');
const weekRange = document.getElementById('weekRange');
const weekTaskModal = document.getElementById('weekTaskModal');
const weekTaskForm = document.getElementById('weekTaskForm');
const weekTaskText = document.getElementById('weekTaskText');
const weekTaskTitle = document.getElementById('weekTaskTitle');

document.addEventListener('DOMContentLoaded', () => {
    renderWeekGrid();
    setupWeekEventListeners();
    scheduleCentering();

    window.addEventListener('resize', () => {
        scheduleCentering();
    });

    if ('ResizeObserver' in window && weekGrid) {
        const observer = new ResizeObserver(() => scheduleCentering());
        observer.observe(weekGrid);
    }

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => scheduleCentering());
    }
});

function setupWeekEventListeners() {
    document.getElementById('prevWeekBtn').addEventListener('click', () => changeWeek(-7));
    document.getElementById('nextWeekBtn').addEventListener('click', () => changeWeek(7));
    document.getElementById('closeWeekTaskModal').addEventListener('click', closeWeekTaskModal);
    document.getElementById('deleteWeekTaskBtn').addEventListener('click', handleDeleteWeekTask);

    weekTaskModal.addEventListener('click', (e) => {
        if (e.target === weekTaskModal) closeWeekTaskModal();
    });

    weekTaskForm.addEventListener('submit', handleWeekTaskSubmit);

    weekGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.week-cell');
        if (!cell) return;
        openWeekTaskModal(cell.dataset.date, parseInt(cell.dataset.hour, 10));
    });
}

function renderWeekGrid() {
    const weekDates = getWeekDates(weekStartDate);
    weekRange.textContent = formatWeekRange(weekStartDate);

    const headerRow = `
        <div class="week-row week-row-header">
            <div class="week-cell week-cell-time"></div>
            ${weekDates.map(date => {
                const label = formatDayHeader(date);
                const dateKey = formatDateKey(date);
                return `<div class="week-cell week-cell-header" data-date="${dateKey}">${label}</div>`;
            }).join('')}
        </div>
    `;

    const hourRows = [];
    const startHour = 8;
    const endHour = 24;
    for (let hour = startHour; hour <= endHour; hour++) {
        const displayHour = hour === 24 ? 0 : hour;
        const timeLabel = `${String(displayHour).padStart(2, '0')}:00`;
        const rowCells = weekDates.map(date => {
            const dateStr = formatDateKey(date);
            const task = getWeekTask(dateStr, hour);
            return `
                <button class="week-cell week-slot ${task ? 'has-task' : ''}" data-date="${dateStr}" data-hour="${hour}">
                    ${task ? escapeHtml(task) : ''}
                </button>
            `;
        }).join('');

        hourRows.push(`
            <div class="week-row">
                <div class="week-cell week-cell-time">${timeLabel}</div>
                ${rowCells}
            </div>
        `);
    }

    weekGrid.innerHTML = headerRow + hourRows.join('');
    scheduleCentering(weekDates);
}

function openWeekTaskModal(dateStr, hour) {
    activeSlot = { dateStr, hour };
    const timeLabel = `${String(hour).padStart(2, '0')}:00`;
    weekTaskTitle.textContent = `${formatDateTitle(dateStr)} • ${timeLabel}`;
    weekTaskText.value = getWeekTask(dateStr, hour) || '';
    weekTaskModal.classList.add('active');
    weekTaskText.focus();
}

function closeWeekTaskModal() {
    weekTaskModal.classList.remove('active');
    weekTaskForm.reset();
    activeSlot = null;
}

function handleWeekTaskSubmit(event) {
    event.preventDefault();
    if (!activeSlot) return;
    const text = weekTaskText.value.trim();
    setWeekTask(activeSlot.dateStr, activeSlot.hour, text);
    closeWeekTaskModal();
    renderWeekGrid();
}

function handleDeleteWeekTask() {
    if (!activeSlot) return;
    setWeekTask(activeSlot.dateStr, activeSlot.hour, '');
    closeWeekTaskModal();
    renderWeekGrid();
}

function changeWeek(days) {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + days);
    weekStartDate = getWeekStart(next);
    renderWeekGrid();
}

function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function getWeekStart(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
}

function formatWeekRange(startDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const startDay = startDate.getDate();
    const endDay = end.getDate();
    const startMonth = months[startDate.getMonth()];
    const endMonth = months[end.getMonth()];

    if (startDate.getMonth() === end.getMonth()) {
        return `${startDay}.–${endDay}. ${startMonth}`;
    }

    return `${startDay}. ${startMonth} – ${endDay}. ${endMonth}`;
}

function formatDayHeader(date) {
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const dayIndex = (date.getDay() + 6) % 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    return `
        <div class="week-day-header ${isToday ? 'today' : ''}">
            <span class="week-day-name">${dayNames[dayIndex]}</span>
            <span class="week-day-number">${date.getDate()}</span>
        </div>
    `;
}

function formatDateTitle(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${date.getDate()}. ${months[date.getMonth()]}`;
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function centerTodayInMobile(weekDates) {
    if (!weekGrid) return;
    if (!window.matchMedia('(max-width: 480px)').matches) return;
    const todayStr = formatDateKey(new Date());
    if (!weekDates.some(date => formatDateKey(date) === todayStr)) return;

    const headerCell = weekGrid.querySelector(`.week-cell-header[data-date="${todayStr}"]`);
    if (!headerCell) return;

    if (typeof headerCell.scrollIntoView === 'function') {
        headerCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        return;
    }

    const containerRect = weekGrid.getBoundingClientRect();
    const cellRect = headerCell.getBoundingClientRect();
    if (!containerRect.width || !cellRect.width) return;

    const currentScroll = weekGrid.scrollLeft;
    const offsetLeft = cellRect.left - containerRect.left;
    const targetScroll = currentScroll + offsetLeft + cellRect.width / 2 - containerRect.width / 2;
    weekGrid.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
}

function scheduleCentering(weekDates = null) {
    const dates = weekDates || getWeekDates(weekStartDate);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => centerTodayInMobile(dates));
    });
    setTimeout(() => centerTodayInMobile(dates), 200);
}

function getWeekTask(dateStr, hour) {
    const data = loadWeekTasks();
    if (!data[dateStr]) return '';
    return data[dateStr][hour] || '';
}

function setWeekTask(dateStr, hour, text) {
    const data = loadWeekTasks();
    if (!data[dateStr]) data[dateStr] = {};

    if (!text) {
        delete data[dateStr][hour];
        if (Object.keys(data[dateStr]).length === 0) {
            delete data[dateStr];
        }
    } else {
        data[dateStr][hour] = text;
    }

    localStorage.setItem('weekPlannerTasks', JSON.stringify(data));
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

