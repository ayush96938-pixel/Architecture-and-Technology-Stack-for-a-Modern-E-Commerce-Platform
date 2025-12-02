// --- CONFIGURATION ---
const LOGIN_KEY = "1234"; // Simple password for the login screen

// --- DOM ELEMENTS ---
// Login Views
const loginContainer = document.getElementById('login-container');
const trackerContent = document.getElementById('tracker-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// App Views
const logForm = document.getElementById('log-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const historyList = document.getElementById('history-list');

// Stats Elements
const latestWeightEl = document.getElementById('latest-weight');
const weightChangeEl = document.getElementById('weight-change');
const totalLogsEl = document.getElementById('total-logs');

// --- STATE MANAGEMENT ---
let progressLogs = JSON.parse(localStorage.getItem('gymProgressLogs')) || [];

// --- AUTHENTICATION FUNCTIONS ---
function checkLogin(e) {
    e.preventDefault();
    const inputKey = document.getElementById('password').value;
    
    if (inputKey === LOGIN_KEY) {
        loginContainer.classList.add('hidden');
        trackerContent.classList.remove('hidden');
        localStorage.setItem('gymAuth', 'true');
        renderProgress();
    } else {
        loginError.textContent = "Incorrect Access Key.";
        document.getElementById('password').value = '';
    }
}

function handleLogout() {
    localStorage.removeItem('gymAuth');
    location.reload(); // Refresh page to reset
}

// Check session on load
if (localStorage.getItem('gymAuth') === 'true') {
    loginContainer.classList.add('hidden');
    trackerContent.classList.remove('hidden');
}

// --- CORE APP FUNCTIONS ---

function getMotivationalQuote() {
    const quotes = [
        "The pain you feel today will be the strength you feel tomorrow.",
        "Strive for progress, not perfection.",
        "Your body can stand almost anything. It’s your mind that you have to convince.",
        "Discipline is doing what needs to be done, even if you don't want to do it.",
        "Obsessed is a word the lazy use to describe the dedicated."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}
document.getElementById('motivational-quote').textContent = getMotivationalQuote();

function saveProgress() {
    // Sort logs by date (newest first)
    progressLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('gymProgressLogs', JSON.stringify(progressLogs));
    renderProgress();
}

function renderProgress() {
    historyList.innerHTML = '';
    
    // 1. Update Stats
    if (progressLogs.length === 0) {
        latestWeightEl.textContent = '--';
        weightChangeEl.textContent = '--';
        totalLogsEl.textContent = '0';
        historyList.innerHTML = '<li style="justify-content:center; color:#555;">No logs yet. Let\'s go!</li>';
    } else {
        const latestLog = progressLogs[0];
        const firstLog = progressLogs[progressLogs.length - 1];
        
        latestWeightEl.textContent = latestLog.weight;
        totalLogsEl.textContent = progressLogs.length;

        const change = (latestLog.weight - firstLog.weight).toFixed(1);
        const symbol = change > 0 ? '+' : '';
        weightChangeEl.textContent = `${symbol}${change} kg`;
        weightChangeEl.style.color = change > 0 ? '#ff4d4d' : (change < 0 ? '#00ff7f' : '#fff');
    }

    // 2. Render List
    progressLogs.forEach(log => {
        const li = document.createElement('li');
        
        let details = `${log.weight} kg`;
        if (log.bodyfat) details += ` | ${log.bodyfat}% BF`;
        
        li.innerHTML = `
            <div class="log-info">
                <span class="log-stats">${details}</span>
                <span class="log-date">${log.date}</span>
            </div>
            <div class="log-actions">
                <button onclick="editLog(${log.id})" class="edit-btn"><i class="fas fa-edit"></i></button>
                <button onclick="deleteLog(${log.id})" class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        historyList.appendChild(li);
    });
}

function handleLogSubmit(e) {
    e.preventDefault();

    const idInput = document.getElementById('edit-id').value;
    const date = document.getElementById('date').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const bodyfat = document.getElementById('bodyfat').value ? parseFloat(document.getElementById('bodyfat').value) : null;

    if (!date || isNaN(weight)) {
        alert("Please fill in Date and Weight");
        return;
    }

    if (idInput) {
        // EDIT EXISTING LOG
        const index = progressLogs.findIndex(log => log.id == idInput);
        if (index !== -1) {
            progressLogs[index] = { id: parseInt(idInput), date, weight, bodyfat };
        }
        exitEditMode();
    } else {
        // CREATE NEW LOG
        const newLog = {
            id: Date.now(), // Unique ID based on timestamp
            date,
            weight,
            bodyfat
        };
        progressLogs.push(newLog);
    }

    saveProgress();
    document.getElementById('log-form').reset();
    // Keep date populated for convenience if needed, or clear it. Here we clear.
}

// --- EDIT / DELETE FUNCTIONS ---

window.editLog = function(id) {
    const log = progressLogs.find(l => l.id === id);
    if (!log) return;

    // Populate form
    document.getElementById('date').value = log.date;
    document.getElementById('weight').value = log.weight;
    document.getElementById('bodyfat').value = log.bodyfat || '';
    document.getElementById('edit-id').value = log.id;

    // Change UI to Edit Mode
    formTitle.textContent = "Edit Log Entry";
    submitBtn.textContent = "Update Entry";
    submitBtn.style.backgroundColor = "#ffa500"; // Orange for edit
    submitBtn.style.color = "#000";
    cancelEditBtn.classList.remove('hidden');

    // Scroll to form
    document.querySelector('.progress-form').scrollIntoView({ behavior: 'smooth' });
}

window.deleteLog = function(id) {
    if(confirm("Are you sure you want to delete this log?")) {
        progressLogs = progressLogs.filter(log => log.id !== id);
        saveProgress();
        // If we were editing this item, exit edit mode
        if (document.getElementById('edit-id').value == id) {
            exitEditMode();
        }
    }
}

function exitEditMode() {
    document.getElementById('log-form').reset();
    document.getElementById('edit-id').value = '';
    
    formTitle.textContent = "Log Today's Progress";
    submitBtn.textContent = "Log Progress";
    submitBtn.style.backgroundColor = "#00ff7f"; // Back to green
    cancelEditBtn.classList.add('hidden');
}

// --- EVENT LISTENERS ---
loginForm.addEventListener('submit', checkLogin);
logoutBtn.addEventListener('click', handleLogout);
logForm.addEventListener('submit', handleLogSubmit);
cancelEditBtn.addEventListener('click', exitEditMode);

// Initial Load
renderProgress();