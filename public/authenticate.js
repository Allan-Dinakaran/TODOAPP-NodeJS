const BASE_URL = "https://todoapp-nodejs-kfue.onrender.com/api";

function checkSession() {
    const token = localStorage.getItem('userToken');
    if (token) {
        document.getElementById('authViews').style.display = 'none';
        document.getElementById('navBar').style.display = 'flex';
        document.getElementById('dashboardView').style.display = 'flex';
        displayUserHeader(token);
        loadTasks(token);
    } else {
        document.getElementById('authViews').style.display = 'flex';
        document.getElementById('navBar').style.display = 'none';
        document.getElementById('dashboardView').style.display = 'none';
    }
}

function displayUserHeader(token) {
    if (!token) return;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.username || payload.name || "User";
        
        const welcomeMsg = document.getElementById('welcomeMsg');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome, ${username}`;
        }
    } catch (e) {
        console.error("Error reading username payload from token:", e);
    }
}

function setupFilterListener() {
    const filterSelect = document.getElementById('taskStatusFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            const token = localStorage.getItem('userToken');
            loadTasks(token);
        });
    }
}

async function loadTasks(token) {
    if (!token) return;
    const listContainer = document.getElementById('liveList');
    const filterSelect = document.getElementById('taskStatusFilter');
    const filterValue = filterSelect ? filterSelect.value : 'all';
    
    let url = `${BASE_URL}/tasks`;
    if (filterValue === 'completed') url = `${BASE_URL}/tasks/completed`;
    if (filterValue === 'incomplete') url = `${BASE_URL}/tasks/incompleted`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await response.json();

        if (!response.ok) throw new Error(tasks.message || "Failed to fetch files");

        if (tasks.length === 0) {
            listContainer.innerHTML = "<p style='color: #6b7280; font-style: italic;'>Your dashboard is clear!</p>";
            return;
        }

        listContainer.innerHTML = tasks.map(task => `
            <div class="task-card" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 15px; border-left: 6px solid ${task.Completed ? '#10b981' : '#4f46e5'}; position: relative;">
                
                <div style="flex: 1; padding-right: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" ${task.Completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.taskid}, this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                        <h3 style="margin: 0; color: #1f2937; ${task.Completed ? 'text-decoration: line-through; color: #9ca3af;' : ''}">${task.taskname || 'Untitled'}</h3>
                    </div>
                    <p style="margin: 0; color: #4b5563; font-size: 14px; word-break: break-word;">${task.Description || 'No description provided'}</p>
                    
                    ${task.fileUrl ? `
                        <div style="margin-top: 12px;">
                            <a href="${task.fileUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-size: 13px; font-weight: bold;">
                                📎 View Attachment
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div>
                    <button class="delete-btn" onclick="deleteTask(${task.taskid})" style="background: #ef4444; color: white; padding: 6px 12px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; white-space: nowrap; transition: background 0.2s;">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = `<p style='color: #ef4444;'>Sync error: ${err.message}</p>`;
    }
}

async function toggleTaskStatus(taskId, statusValue) {
    const token = localStorage.getItem('userToken');
    try {
        const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // 🟢 FIXED: Sends 'isCompleted' payload property matching the backend routing handler expectation
            body: JSON.stringify({ isCompleted: statusValue }) 
        });

        if (response.ok) {
            loadTasks(token); 
        }
    } catch (err) {
        console.error("Failed updating execution status criteria:", err);
    }
}


document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            alert("Registration complete! You can now log in.");
            document.getElementById('registerForm').reset();
        } else {
            const errText = await response.text();
            alert(`Error: ${errText}`);
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userToken', data.token);
            checkSession();
        } else {
            alert(`Login Failed: ${data.message || 'Check credentials'}`);
        }
    } catch (err) {
        console.error(err);
    }
});

const fileInput = document.getElementById('taskFile');
const clearBtn = document.getElementById('clearFileBtn');

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }
});

clearBtn.addEventListener('click', () => {
    fileInput.value = "";
    clearBtn.style.display = 'none';
});

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const formElement = document.getElementById('taskForm');
    const formData = new FormData(formElement);

    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData 
        });

        if (response.ok) {
            formElement.reset();
            document.getElementById('clearFileBtn').style.display = 'none'; 
            loadTasks(token); 
        } else {
            const data = await response.json();
            alert(`Could not save task: ${data.message || 'Server rejected request'}`);
        }
    } catch (err) {
        console.error("Task creation network error:", err);
        alert("Network error: Failed to connect to server.");
    }
});

async function deleteTask(taskId) {
    if (!confirm("Remove this item?")) return;
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadTasks(token);
        }
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userToken');
    checkSession();
});

document.addEventListener('DOMContentLoaded', setupFilterListener);
checkSession();