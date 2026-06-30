
const API_BASE_URL = '/'; 

const AUTH_TOKEN = localStorage.getItem('token');

if (!AUTH_TOKEN) {
  window.location.href = '/auth.html'; 
}

const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const editTaskIdInput = document.getElementById('editTaskId');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const fileEditWarning = document.getElementById('fileEditWarning');

const getHeaders = () => ({
  'Authorization': `Bearer ${AUTH_TOKEN}`
});

async function loadTasks() {
  try {
    const res = await fetch(API_BASE_URL, { headers: getHeaders() });
    const tasks = await res.json();
    
    if (!res.ok) throw new Error(tasks.message || "Failed to load tasks");
    
    if (tasks.length === 0) {
      tasksContainer.innerHTML = `<p>No tasks created yet. Add one above!</p>`;
      return;
    }

    tasksContainer.innerHTML = tasks.map(task => {
      let attachmentHTML = '';
      if (task.fileUrl) {
        const isImage = task.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        attachmentHTML = isImage 
          ? `<img src="${task.fileUrl}" alt="Task Asset">`
          : `<a href="${task.fileUrl}" target="_blank" class="file-link">📁 View Attached Document</a>`;
      }

      return `
        <div class="task-card">
          <h3>${task.title}</h3>
          <p>${task.description || 'No description provided.'}</p>
          ${attachmentHTML}
          <div class="actions">
            <button class="btn-edit" onclick="startEdit(${task.taskid}, '${escape(task.title)}', '${escape(task.description || '')}')">Edit</button>
            <button class="btn-delete" onclick="deleteTask(${task.taskid})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    tasksContainer.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const fileInput = document.getElementById('attachment');
  const isEditing = editTaskIdInput.value;

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  
  if (fileInput.files[0]) {
    formData.append('attachment', fileInput.files[0]);
  }

  const url = isEditing ? `${API_BASE_URL}${isEditing}` : API_BASE_URL;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    const res = await fetch(url, {
      method: method,
      headers: getHeaders(),
      body: formData 
    });

    if (!res.ok) throw new Error("Network request execution error occurred");

    taskForm.reset();
    resetFormState();
    loadTasks();
  } catch (err) {
    alert(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete task");
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

function startEdit(id, escapedTitle, escapedDescription) {
  editTaskIdInput.value = id;
  document.getElementById('title').value = unescape(escapedTitle);
  document.getElementById('description').value = unescape(escapedDescription);
  
  submitBtn.innerText = 'Update Task';
  cancelEditBtn.style.display = 'inline-block';
  fileEditWarning.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetFormState);

function resetFormState() {
  editTaskIdInput.value = '';
  submitBtn.innerText = 'Create Task';
  cancelEditBtn.style.display = 'none';
  fileEditWarning.style.display = 'none';
  taskForm.reset();
}

loadTasks();