const BASE_URL = "https://todoapp-nodejs-kfue.onrender.com/api";

function checkSession() {
    const token = localStorage.getItem('userToken');
    if (token) {
        document.getElementById('authViews').style.display = 'none';
        document.getElementById('navBar').style.display = 'flex';
        document.getElementById('dashboardView').style.display = 'flex';
        loadTasks(token);
    } else {
        document.getElementById('authViews').style.display = 'flex';
        document.getElementById('navBar').style.display = 'none';
        document.getElementById('dashboardView').style.display = 'none';
    }
}

async function loadTasks(token) {
    const listContainer = document.getElementById('liveList');
    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await response.json();

        if (!response.ok) throw new Error(tasks.message || "Failed to fetch");

        if (tasks.length === 0) {
            listContainer.innerHTML = "<p style='color: #6b7280;'>Your dashboard is clear!</p>";
            return;
        }

        listContainer.innerHTML = tasks.map(task => `
            <div class="task-card">
                <h3>${task.title || 'Untitled'}</h3>
                <p>${task.description || 'No description provided'}</p>
                <button class="delete-btn" onclick="deleteTask(${task.taskid})">Delete</button>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = `<p style='color: #ef4444;'>Sync error: ${err.message}</p>`;
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

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;

    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            document.getElementById('taskForm').reset();
            loadTasks(token);
        }
    } catch (err) {
        console.error(err);
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

checkSession();