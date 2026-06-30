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
        <h3>${task.taskname || 'Untitled'}</h3>
        <p>${task.Description || 'No description provided'}</p>
        
        ${task.fileUrl ? `
            <div style="margin-top: 10px;">
                <a href="${task.fileUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-size: 13px; font-weight: bold;">
                    📎 View Attachment
                </a>
            </div>
        ` : ''}
        
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
    
    // 🟢 PASS THE FORM ELEMENT DIRECTLY: This forces the browser to handle multipart correctly
    const formElement = document.getElementById('taskForm');
    const formData = new FormData(formElement);

    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: formData 
        });

        if (response.ok) {
            formElement.reset();
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

checkSession();