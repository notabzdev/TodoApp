// Dashboard JavaScript - Clean Version
class TaskFlowDashboard {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.selectedTheme = null;
        this.isFirstTimeUser = false;
        this.editingTaskId = null; // Track which task is being edited
        this.originalTaskData = null; // Store original data for cancel

        this.init();
    }

    async init() {
        console.log('Initializing TaskFlow Dashboard...');

        // Check authentication and load user data
        await this.checkAuth();

        // Initialize UI components
        this.setupEventListeners();

        // Check if first time user and show theme selection
        await this.checkFirstTimeUser();

        // Load user's tasks
        await this.loadTasks();

        console.log('Dashboard initialized successfully');
    }

    async checkAuth() {
        const sessionToken = localStorage.getItem('sessionToken');

        if (!sessionToken) {
            console.log('No session token found, redirecting to login');
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': sessionToken
                }
            });

            if (!response.ok) {
                throw new Error('Session expired');
            }

            const data = await response.json();
            this.currentUser = data.user;

            console.log('User authenticated:', this.currentUser);
            this.updateUserInfo();

        } catch (error) {
            console.error('Authentication failed:', error);
            localStorage.removeItem('sessionToken');
            window.location.href = '/login';
        }
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name;
        }
    }

    async checkFirstTimeUser() {
        const hasVisitedBefore = localStorage.getItem(`visited_${this.currentUser.id}`);
        const userTheme = this.currentUser.theme;

        console.log('First time check:', {
            hasVisitedBefore,
            userTheme,
            defaultTheme: userTheme === 'cosmic'
        });

        if (!hasVisitedBefore || userTheme === 'cosmic') {
            console.log('First time user detected - showing theme selection');
            this.isFirstTimeUser = true;
            this.showThemeSelection();
        } else {
            this.applyTheme(userTheme);
        }
    }

    showThemeSelection() {
        const modal = document.getElementById('themeModal');
        modal.classList.remove('hidden');

        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                themeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                this.selectedTheme = card.dataset.theme;
                document.getElementById('confirmTheme').disabled = false;

                console.log('Theme selected:', this.selectedTheme);
            });
        });
    }

    async applyTheme(theme) {
        console.log('Applying theme:', theme);

        const body = document.body;
        body.classList.remove('theme-galactic', 'theme-corporate', 'theme-nature', 'theme-dark');
        body.classList.add(`theme-${theme}`);
        body.dataset.theme = theme;

        if (this.currentUser && theme !== this.currentUser.theme) {
            try {
                const response = await fetch('/api/user/theme', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('sessionToken')
                    },
                    body: JSON.stringify({ theme: theme })
                });

                if (response.ok) {
                    this.currentUser.theme = theme;
                    console.log('Theme saved to server');
                }
            } catch (error) {
                console.error('Failed to save theme:', error);
            }
        }
    }

    setupEventListeners() {
        // Theme confirmation
        document.getElementById('confirmTheme').addEventListener('click', () => {
            if (this.selectedTheme) {
                this.applyTheme(this.selectedTheme);
                localStorage.setItem(`visited_${this.currentUser.id}`, 'true');
                document.getElementById('themeModal').classList.add('hidden');
                console.log('Theme selection completed');
            }
        });

        // Theme change button
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.showThemeSelection();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            console.log('Settings clicked - feature coming soon');
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Task creation buttons
        document.getElementById('createTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('createGroupBtn').addEventListener('click', () => {
            this.showTaskModal(true);
        });

        // Task modal handlers
        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.hideTaskModal();
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // View toggle buttons
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.setView('grid');
        });

        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.setView('list');
        });
    }

    showTaskModal(isGroup = false, taskToEdit = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const submitBtn = document.getElementById('submitTaskBtn');
        const typeRadios = document.querySelectorAll('input[name="taskType"]');

        // Store editing state
        this.editingTaskId = taskToEdit ? taskToEdit.id : null;

        if (taskToEdit) {
            // Edit mode
            title.textContent = 'Edit Task';
            submitBtn.textContent = 'Update Task';

            // Populate form with existing data
            document.getElementById('taskTitle').value = taskToEdit.title;
            document.getElementById('taskDescription').value = taskToEdit.description || '';
            document.getElementById('taskPriority').value = taskToEdit.priority;
            document.getElementById('taskDueDate').value = taskToEdit.due_date || '';

            // Set task type radio
            typeRadios.forEach(radio => {
                radio.checked = radio.value === taskToEdit.type;
            });
        } else {
            // Create mode
            if (isGroup) {
                title.textContent = 'Create New Task Group';
                typeRadios.forEach(radio => {
                    if (radio.value === 'group') {
                        radio.checked = true;
                    }
                });
            } else {
                title.textContent = 'Create New Task';
                typeRadios.forEach(radio => {
                    if (radio.value === 'individual') {
                        radio.checked = true;
                    }
                });
            }
            submitBtn.textContent = 'Create Task';
        }

        modal.classList.remove('hidden');
    }

    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.add('hidden');
        document.getElementById('taskForm').reset();
        this.editingTaskId = null;
    }

    async createTask() {
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            type: document.querySelector('input[name="taskType"]:checked').value
        };

        if (!taskData.title) {
            alert('Task title is required');
            return;
        }

        try {
            let response;

            if (this.editingTaskId) {
                // Edit existing task
                console.log('Updating task:', this.editingTaskId, taskData);
                response = await fetch(`/api/tasks/${this.editingTaskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('sessionToken')
                    },
                    body: JSON.stringify(taskData)
                });
            } else {
                // Create new task
                console.log('Creating new task:', taskData);
                response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('sessionToken')
                    },
                    body: JSON.stringify(taskData)
                });
            }

            if (!response.ok) {
                throw new Error(`Failed to ${this.editingTaskId ? 'update' : 'create'} task: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Task ${this.editingTaskId ? 'updated' : 'created'} successfully:`, result);

            // Reload tasks from server to get the latest data
            await this.loadTasks();
            this.hideTaskModal();

        } catch (error) {
            console.error(`Error ${this.editingTaskId ? 'updating' : 'creating'} task:`, error);
            alert(`Failed to ${this.editingTaskId ? 'update' : 'create'} task. Please try again.`);
        }
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': localStorage.getItem('sessionToken')
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load tasks: ${response.status}`);
            }

            const data = await response.json();
            this.tasks = data.tasks || [];

            console.log('Tasks loaded from server:', this.tasks);
            this.renderTasks();

        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.renderTasks();
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');

        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="welcome-message">
                    <h3>Welcome to your TaskFlow Dashboard!</h3>
                    <p>Create your first task or task group to get started.</p>
                </div>
            `;
            return;
        }

        const tasksHTML = this.tasks.map(task => this.createTaskHTML(task)).join('');
        container.innerHTML = tasksHTML;
        this.setupTaskEventListeners();
    }

    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const typeClass = task.type === 'group' ? 'task-group' : 'task-individual';
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

        return `
            <div class="task-card ${typeClass} ${priorityClass} ${completedClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <h4 class="task-title" data-field="title" contenteditable="false">${this.escapeHtml(task.title)}</h4>
                    <div class="task-actions">
                        <button class="task-action-btn complete-btn" title="Toggle Complete">
                            ${task.completed ? '✓' : '○'}
                        </button>
                        <button class="task-action-btn edit-btn" title="Edit Task">✏️</button>
                        <button class="task-action-btn delete-btn" title="Delete Task">🗑️</button>
                    </div>
                </div>
                
                ${task.description ? `<p class="task-description" data-field="description" contenteditable="false">${this.escapeHtml(task.description)}</p>` : `<p class="task-description" data-field="description" contenteditable="false" style="font-style: italic; opacity: 0.5;">Click to add description...</p>`}
                
                <div class="edit-controls">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
                
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    ${dueDate ? `<span class="task-due-date">Due: ${dueDate}</span>` : ''}
                    <span class="task-type">${task.type === 'group' ? 'Group' : 'Task'}</span>
                </div>
            </div>
        `;
    }

    setupTaskEventListeners() {
        // Complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.toggleTaskComplete(taskId);
            });
        });

        // Edit buttons (modal editing)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                const task = this.tasks.find(t => t.id == taskId);
                if (task) {
                    this.showTaskModal(false, task);
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.deleteTask(taskId);
            });
        });

        // Inline editing - Task titles
        document.querySelectorAll('.task-title').forEach(title => {
            title.addEventListener('click', (e) => {
                if (!title.hasAttribute('contenteditable') || title.getAttribute('contenteditable') === 'false') {
                    this.startInlineEdit(title);
                }
            });

            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveInlineEdit(title);
                } else if (e.key === 'Escape') {
                    this.cancelInlineEdit(title);
                }
            });

            title.addEventListener('blur', () => {
                this.saveInlineEdit(title);
            });
        });

        // Inline editing - Task descriptions
        document.querySelectorAll('.task-description').forEach(desc => {
            desc.addEventListener('click', (e) => {
                if (!desc.hasAttribute('contenteditable') || desc.getAttribute('contenteditable') === 'false') {
                    this.startInlineEdit(desc);
                }
            });

            desc.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.saveInlineEdit(desc);
                } else if (e.key === 'Escape') {
                    this.cancelInlineEdit(desc);
                }
            });

            desc.addEventListener('blur', () => {
                this.saveInlineEdit(desc);
            });
        });

        // Edit control buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                const editableElement = taskCard.querySelector('[contenteditable="true"]');
                if (editableElement) {
                    this.saveInlineEdit(editableElement);
                }
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                const editableElement = taskCard.querySelector('[contenteditable="true"]');
                if (editableElement) {
                    this.cancelInlineEdit(editableElement);
                }
            });
        });
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id != taskId);
            this.renderTasks();
        }
    }

    editTask(taskId) {
        console.log('Edit task:', taskId);
        alert('Edit functionality coming soon!');
    }

    // Inline editing functions
    startInlineEdit(element) {
        const taskCard = element.closest('.task-card');
        const taskId = taskCard.dataset.taskId;
        const task = this.tasks.find(t => t.id == taskId);

        if (!task) return;

        // Store original data for cancel
        this.originalTaskData = {
            title: task.title,
            description: task.description || ''
        };

        // Set up editing
        element.setAttribute('contenteditable', 'true');
        element.classList.add('editing');
        element.focus();

        // Show edit controls
        const editControls = taskCard.querySelector('.edit-controls');
        editControls.classList.add('active');

        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    async saveInlineEdit(element) {
        const taskCard = element.closest('.task-card');
        const taskId = parseInt(taskCard.dataset.taskId);
        const field = element.dataset.field;
        const newValue = element.textContent.trim();

        // Find the task
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // If no change, just cancel editing
        const originalValue = field === 'title' ? this.originalTaskData?.title : this.originalTaskData?.description;
        if (newValue === originalValue || (newValue === 'Click to add description...' && !originalValue)) {
            this.cancelInlineEdit(element);
            return;
        }

        // Validate
        if (field === 'title' && !newValue) {
            alert('Task title cannot be empty');
            this.cancelInlineEdit(element);
            return;
        }

        try {
            // Update via API
            const updateData = {};
            updateData[field] = newValue;

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('sessionToken')
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Update local data
            task[field] = newValue;

            // Clean up editing state
            this.finishInlineEdit(element);

            console.log(`Task ${field} updated successfully`);

        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
            this.cancelInlineEdit(element);
        }
    }

    cancelInlineEdit(element) {
        const field = element.dataset.field;
        const originalValue = field === 'title' ? this.originalTaskData?.title : this.originalTaskData?.description;

        // Restore original content
        if (field === 'description' && !originalValue) {
            element.innerHTML = '<em style="opacity: 0.5;">Click to add description...</em>';
        } else {
            element.textContent = originalValue || '';
        }

        this.finishInlineEdit(element);
    }

    finishInlineEdit(element) {
        const taskCard = element.closest('.task-card');

        // Remove editing state
        element.setAttribute('contenteditable', 'false');
        element.classList.remove('editing');

        // Hide edit controls
        const editControls = taskCard.querySelector('.edit-controls');
        editControls.classList.remove('active');

        // Clear stored data
        this.originalTaskData = null;
    }

    setView(viewType) {
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');

        if (viewType === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }

        console.log('View changed to:', viewType);
    }

    async logout() {
        console.log('Logout initiated');

        try {
            const sessionToken = localStorage.getItem('sessionToken');
            if (sessionToken) {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': sessionToken
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear storage and redirect
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('newAccountEmail');
        window.location.replace('/login');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskFlowDashboard();
});