
const API_BASE_URL = "https://todoapp-nodejs-kfue.onrender.com/api/tasks"; 

async function loadTasks() {
    const listContainer = document.getElementById('liveList');
    
    try {
        const response = await fetch(API_BASE_URL);
        const tasks = await response.json();

        // If the database has no tasks yet
        if (!tasks || tasks.length === 0) {
            listContainer.innerHTML = "<p style='color: #6b7280;'>No current tasks found. Create one to get started!</p>";
            return;
        }

        listContainer.innerHTML = tasks.map(task => `
            <div class="task-card">
                <h3>${task.title || 'Untitled Task'}</h3>
                <p>${task.description || 'No description provided.'}</p>
            </div>
        `).join('');

    } catch (err) {
        console.error("Failed to fetch tasks from database:", err);
        listContainer.innerHTML = "<p style='color: #ef4444;'>Failed to sync dashboard items from the server.</p>";
    }
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Grabbing the input values using the IDs present in your HTML
    const title = document.getElementById('regUsername').value;
    const description = document.getElementById('regEmail').value;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            // Reset the form input fields
            document.getElementById('registerForm').reset();
            // Automatically refresh the display column without reloading the page
            loadTasks(); 
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || data.error || 'Could not save task'}`);
        }
    } catch (err) {
        console.error("Task submission network error:", err);
        alert("Network error: Could not reach the task manager server.");
    }
});

loadTasks();