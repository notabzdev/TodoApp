// Dashboard JavaScript - Main Class and Core Functionality
// Emergency reset function for fluid mode issues
window.resetFluidMode = function() {
    console.log('Emergency fluid mode reset');

    // Clear all stored settings
    localStorage.removeItem('taskflow-fluid-settings');
    const userId = window.dashboard?.currentUser?.id || 'unknown';
    localStorage.removeItem(`taskflow-task-positions-${userId}`);

    // Force disable fluid mode
    document.body.classList.remove('fluid-mode', 'fluid-mode-transitioning');

    // Reset UI elements
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.classList.remove('show');
    }

    // Clear any running animations/intervals
    document.querySelectorAll('.task-card').forEach(card => {
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
        card.style.transform = '';
        card.classList.remove('dragging', 'collision-warning', 'being-hovered', 'hovering-over-task');
    });

    // Reload the page to clean state
    setTimeout(() => {
        window.location.reload();
    }, 500);
};

// Prevent class redeclaration
if (typeof window.TaskFlowDashboard !== 'undefined') {
    console.warn('TaskFlowDashboard already exists, using existing instance');
} else {

    class TaskFlowDashboard {
        constructor() {
            this.currentUser = null;
            this.tasks = [];
            this.selectedTheme = null;
            this.isFirstTimeUser = false;
            this.editingTaskId = null;
            this.originalTaskData = null;
            this.isLoadingTasks = false;
            this.initializationComplete = false;

            this.init();
        }

        async init() {
            if (this.initializationComplete) {
                console.log('Dashboard already initialized, skipping...');
                return;
            }

            console.log('Initializing TaskFlow Dashboard...');

            try {
                // Check authentication and load user data
                await this.checkAuth();

                // Initialize UI components
                this.setupEventListeners();

                // Load view preference
                this.loadViewPreference();

                // Check if first time user and show theme selection
                await this.checkFirstTimeUser();

                // Load user's tasks
                await this.loadTasks();

                this.initializationComplete = true;
                console.log('Dashboard initialized successfully');
            } catch (error) {
                console.error('Dashboard initialization failed:', error);
            }
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

            // Generate individual theme previews dynamically
            this.generateThemePreviews();

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

        generateThemePreviews() {
            const themeOptions = document.querySelector('.theme-options');

            const themes = [
                {
                    id: 'galactic',
                    name: 'Galactic',
                    description: 'Cosmic design with stellar animations',
                    headerColor: '#db2777',
                    bgGradient: 'linear-gradient(135deg, #0a0a0f, #2d1b69)',
                    taskColor: 'rgba(248, 250, 252, 0.7)',
                    animated: false
                },
                {
                    id: 'corporate',
                    name: 'Corporate',
                    description: 'Clean, professional interface',
                    headerColor: '#3b82f6',
                    bgGradient: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    taskColor: 'rgba(30, 41, 59, 0.7)',
                    animated: false
                },
                {
                    id: 'nature',
                    name: 'Nature',
                    description: 'Earthy tones with organic feel',
                    headerColor: '#84cc16',
                    bgGradient: 'linear-gradient(135deg, #fefdf8, #f0f4e8)',
                    taskColor: 'rgba(54, 83, 20, 0.7)',
                    animated: false
                },
                {
                    id: 'dark',
                    name: 'Dark Mode',
                    description: 'Sleek dark interface, easy on the eyes',
                    headerColor: '#8b5cf6',
                    bgGradient: 'linear-gradient(135deg, #111827, #1f2937)',
                    taskColor: 'rgba(209, 213, 219, 0.7)',
                    animated: false
                },
                {
                    id: 'sky',
                    name: 'Sky Dreams',
                    description: 'Peaceful clouds and azure skies',
                    headerColor: '#0ea5e9',
                    bgGradient: 'linear-gradient(135deg, #87CEEB, #E0F6FF)',
                    taskColor: 'rgba(30, 58, 138, 0.7)',
                    animated: true
                },
                {
                    id: 'neon',
                    name: 'Neon City',
                    description: 'Cyberpunk vibes with electric colors',
                    headerColor: '#ff0080',
                    bgGradient: 'linear-gradient(135deg, #0a0a0a, #1a0a1a)',
                    taskColor: 'rgba(0, 255, 255, 0.6)',
                    animated: true
                }
            ];

            themeOptions.innerHTML = themes.map(theme => `
        <div class="theme-card" data-theme="${theme.id}">
            ${theme.animated ? `
                <div class="performance-warning">
                    ⚠️
                    <div class="performance-tooltip">
                        Animated theme may affect performance
                    </div>
                </div>
            ` : ''}
            <div class="theme-preview ${theme.id}-preview" style="background: ${theme.bgGradient};">
                <div class="preview-header" style="background: ${theme.headerColor}; opacity: 0.8;"></div>
                <div class="preview-content">
                    <div class="preview-task" style="background: ${theme.taskColor};"></div>
                    <div class="preview-task" style="background: ${theme.taskColor};"></div>
                    <div class="preview-task" style="background: ${theme.taskColor}; width: 60%;"></div>
                </div>
            </div>
            <h3>${theme.name}</h3>
            <p>${theme.description}</p>
        </div>
    `).join('');
        }

        async applyTheme(theme) {
            console.log('Applying theme:', theme);

            const body = document.body;
            body.classList.remove('theme-galactic', 'theme-corporate', 'theme-nature', 'theme-dark', 'theme-sky', 'theme-neon');
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

            // Logout button
            document.getElementById('logoutBtn').addEventListener('click', () => {
                this.logout();
            });

            // Task creation buttons
            const createGroupBtn = document.getElementById('createGroupBtn');
            if (createGroupBtn) {
                createGroupBtn.addEventListener('click', () => {
                    this.showTaskModal(true);
                });
            }

            const createTaskBtnSidebar = document.getElementById('createTaskBtnSidebar');
            if (createTaskBtnSidebar) {
                createTaskBtnSidebar.addEventListener('click', () => {
                    this.showTaskModal(false);
                });
            }

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

            // Filter checkboxes for sidebar
            this.setupFilterListeners();
        }

        setupFilterListeners() {
            const filterOptions = document.querySelectorAll('.sidebar .filter-option');

            filterOptions.forEach(filterButton => {
                filterButton.addEventListener('click', (e) => {
                    e.preventDefault();

                    const checkbox = filterButton.querySelector('input[type="checkbox"]');
                    const filterType = filterButton.dataset.filter;

                    // Toggle checkbox and button state
                    checkbox.checked = !checkbox.checked;

                    if (checkbox.checked) {
                        filterButton.classList.add('active');
                    } else {
                        filterButton.classList.remove('active');
                    }

                    // Special logic for "All Tasks" - uncheck others when selected
                    if (filterType === 'all' && checkbox.checked) {
                        filterOptions.forEach(option => {
                            if (option !== filterButton) {
                                option.classList.remove('active');
                                option.querySelector('input').checked = false;
                            }
                        });
                    }

                    // If any specific filter is checked, uncheck "All Tasks"
                    if (filterType !== 'all' && checkbox.checked) {
                        const allTasksFilter = document.querySelector('.sidebar .filter-option[data-filter="all"]');
                        if (allTasksFilter) {
                            allTasksFilter.classList.remove('active');
                            allTasksFilter.querySelector('input').checked = false;
                        }
                    }

                    // If no filters are active, activate "All Tasks"
                    const activeFilters = document.querySelectorAll('.sidebar .filter-option.active');
                    if (activeFilters.length === 0) {
                        const allTasksFilter = document.querySelector('.sidebar .filter-option[data-filter="all"]');
                        if (allTasksFilter) {
                            allTasksFilter.classList.add('active');
                            allTasksFilter.querySelector('input').checked = true;
                        }
                    }

                    this.applyFilters();
                });
            });

            // Initialize active states and counts
            this.updateFilterCounts();
            this.initializeFilterStates();
        }

        initializeFilterStates() {
            const filterOptions = document.querySelectorAll('.sidebar .filter-option');

            filterOptions.forEach(filterButton => {
                const checkbox = filterButton.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    filterButton.classList.add('active');
                }
            });
        }

        updateFilterCounts() {
            if (!this.tasks) {
                this.tasks = [];
            }

            const counts = {
                all: this.tasks.length,
                completed: this.tasks.filter(task => task.completed).length,
                inProgress: this.tasks.filter(task => !task.completed).length,
                highPriority: this.tasks.filter(task => task.priority === 'high').length
            };

            console.log('Updating filter counts:', counts);

            // Update sidebar badge counts
            const allCountEl = document.getElementById('allCountSidebar');
            const completedCountEl = document.getElementById('completedCountSidebar');
            const inProgressCountEl = document.getElementById('inProgressCountSidebar');
            const highPriorityCountEl = document.getElementById('highPriorityCountSidebar');

            if (allCountEl) allCountEl.textContent = counts.all;
            if (completedCountEl) completedCountEl.textContent = counts.completed;
            if (inProgressCountEl) inProgressCountEl.textContent = counts.inProgress;
            if (highPriorityCountEl) highPriorityCountEl.textContent = counts.highPriority;

            return counts;
        }

        applyFilters() {
            const activeFilterButtons = document.querySelectorAll('.sidebar .filter-option.active');
            const activeFilters = Array.from(activeFilterButtons).map(btn => btn.dataset.filter);

            // Remove duplicates
            const uniqueFilters = [...new Set(activeFilters)];

            console.log('Active filters:', uniqueFilters);
            this.filterTasks(uniqueFilters);
        }

        filterTasks(activeFilters) {
            let filteredTasks = [...this.tasks];

            if (!activeFilters.includes('all')) {
                filteredTasks = this.tasks.filter(task => {
                    for (let filter of activeFilters) {
                        switch (filter) {
                            case 'completed':
                                if (task.completed) return true;
                                break;
                            case 'in-progress':
                                if (!task.completed) return true;
                                break;
                            case 'high-priority':
                                if (task.priority === 'high') return true;
                                break;
                        }
                    }
                    return false;
                });
            }

            this.renderFilteredTasks(filteredTasks);
            this.updateTaskCounter(filteredTasks.length, this.tasks.length);
        }

        renderFilteredTasks(filteredTasks) {
            const container = document.getElementById('tasksContainer');

            if (filteredTasks.length === 0) {
                container.innerHTML = `
                <div class="welcome-message">
                    <h3>No tasks match the selected filters</h3>
                    <p>Try adjusting your filters or create a new task.</p>
                </div>
            `;
                return;
            }

            const tasksHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
            container.innerHTML = tasksHTML;
            this.setupTaskEventListeners();
        }

        updateTaskCounter(filteredCount, totalCount) {
            const workspaceHeader = document.querySelector('.workspace-header h2');
            if (!workspaceHeader) return;

            if (filteredCount === totalCount) {
                workspaceHeader.textContent = `My Workspace (${totalCount} tasks)`;
            } else {
                workspaceHeader.textContent = `My Workspace (${filteredCount} of ${totalCount} tasks)`;
            }
        }

        renderTasks() {
            this.applyFilters();
        }

        createTaskHTML(task) {
            const priorityClass = `priority-${task.priority}`;
            const typeClass = task.type === 'group' ? 'task-group' : 'task-individual';
            const completedClass = task.completed ? 'completed' : '';
            const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

            // Apply saved color if it exists
            const colorStyle = task.color ? `style="background: ${task.color} !important;"` : '';

            return `
        <div class="task-card ${typeClass} ${priorityClass} ${completedClass}" 
             data-task-id="${task.id}" 
             ${colorStyle}>
            <div class="task-header">
                <div class="task-left">
                    <button class="task-action-btn complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                        ${task.completed ? '✓' : ''}
                    </button>
                    <h4 class="task-title" data-field="title" contenteditable="false">${this.escapeHtml(task.title)}</h4>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" title="Edit Task">✏️</button>
                    <button class="task-action-btn delete-btn" title="Delete Task">🗑️</button>
                </div>
            </div>
            
            ${task.description ?
                `<p class="task-description" data-field="description" contenteditable="false">${this.escapeHtml(task.description)}</p>` :
                `<p class="task-description" data-field="description" contenteditable="false"><em style="opacity: 0.5;">Click to add description...</em></p>`
            }
            
            <div class="edit-controls">
                <button class="save-btn" title="Save Changes"></button>
                <button class="cancel-btn" title="Cancel Editing"></button>
            </div>
            
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                ${dueDate ? `<span class="task-due-date">📅 ${dueDate}</span>` : ''}
                <span class="task-type">${task.type === 'group' ? '📁 Group' : '📋 Task'}</span>
            </div>
        </div>
    `;
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;

            notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

            if (type === 'error') {
                notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } else if (type === 'success') {
                notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else {
                notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            }

            document.body.appendChild(notification);

            requestAnimationFrame(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 4000);
        }

        setView(viewType) {
            const gridBtn = document.getElementById('gridViewBtn');
            const listBtn = document.getElementById('listViewBtn');
            const tasksContainer = document.getElementById('tasksContainer');

            if (viewType === 'grid') {
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            } else {
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            }

            tasksContainer.classList.add('switching-view');

            setTimeout(() => {
                tasksContainer.classList.remove('grid-view', 'list-view');
                tasksContainer.classList.add(`${viewType}-view`);
                tasksContainer.classList.remove('switching-view');
                localStorage.setItem('taskflow-view-preference', viewType);
            }, 150);

            console.log('View changed to:', viewType);
        }

        loadViewPreference() {
            const savedView = localStorage.getItem('taskflow-view-preference') || 'grid';
            this.setView(savedView);
        }

        async loadTasks() {
            if (this.isLoadingTasks) {
                console.log('Tasks already loading, skipping...');
                return;
            }

            this.isLoadingTasks = true;

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

                // Update filter counts when tasks are loaded
                this.updateFilterCounts();

                // Render with current filters
                this.renderTasks();

            } catch (error) {
                console.error('Error loading tasks:', error);
                this.tasks = [];
                this.updateFilterCounts();
                this.renderTasks();
            } finally {
                this.isLoadingTasks = false;
            }
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

                // Show success notification
                this.showNotification(`Task ${this.editingTaskId ? 'updated' : 'created'} successfully!`, 'success');

                // Reload tasks from server to get the latest data
                await this.loadTasks();

                // Update filter counts after loading tasks
                this.updateFilterCounts();

                this.hideTaskModal();

            } catch (error) {
                console.error(`Error ${this.editingTaskId ? 'updating' : 'creating'} task:`, error);
                this.showNotification(`Failed to ${this.editingTaskId ? 'update' : 'create'} task. Please try again.`, 'error');
            }
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
        }

        async toggleTaskComplete(taskId) {
            const task = this.tasks.find(t => t.id == taskId);
            if (!task) return;

            const newCompletedState = !task.completed;

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('sessionToken')
                    },
                    body: JSON.stringify({ completed: newCompletedState })
                });

                if (!response.ok) {
                    throw new Error('Failed to update task completion');
                }

                // Update local state
                task.completed = newCompletedState;

                // Update filter counts in real-time
                this.updateFilterCounts();

                // Show notification
                this.showNotification(
                    `Task marked as ${newCompletedState ? 'complete' : 'incomplete'}!`,
                    'success'
                );

                // Re-render tasks to update UI
                this.renderTasks();

            } catch (error) {
                console.error('Error toggling task completion:', error);
                this.showNotification('Failed to update task. Please try again.', 'error');
            }
        }

        async deleteTask(taskId) {
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': localStorage.getItem('sessionToken')
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }

                // Remove from local array
                this.tasks = this.tasks.filter(t => t.id != taskId);

                // Update filter counts in real-time
                this.updateFilterCounts();

                // Show notification
                this.showNotification('Task deleted successfully!', 'success');

                // Re-render tasks
                this.renderTasks();

            } catch (error) {
                console.error('Error deleting task:', error);
                this.showNotification('Failed to delete task. Please try again.', 'error');
            }
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

// Set window.TaskFlowDashboard to the class
    window.TaskFlowDashboard = TaskFlowDashboard;

} // End of class redeclaration check

// Initialize dashboard when DOM is ready - only once
if (!window.dashboard) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Initializing dashboard instance...');
        window.dashboard = new TaskFlowDashboard();
    });
}
// ===== ADD THIS TO YOUR DASHBOARD INITIALIZATION =====
// Add to dashboard.js where you initialize the dashboard (usually in DOMContentLoaded)

// After creating dashboard instance (e.g., window.dashboard = new TaskFlowDashboard())

// Initialize expanded groups set if it doesn't exist
// ===== FIXED INITIALIZATION - DASHBOARD COLOR PERSISTENCE =====

// Ensure expandedGroups set exists
if (!window.dashboard.expandedGroups) {
    window.dashboard.expandedGroups = new Set();
}

// Run restores after dashboard is initialized
document.addEventListener('DOMContentLoaded', () => {
    const initPersistence = () => {
        if (window.dashboard) {
            if (window.dashboard.restoreTaskColors) {
                window.dashboard.restoreTaskColors();
            }
            if (window.dashboard.restoreExpandedGroups) {
                window.dashboard.restoreExpandedGroups();
            }
            console.log('✅ Color & group persistence initialized');
        } else {
            setTimeout(initPersistence, 300);
        }
    };
    setTimeout(initPersistence, 500);
});

// Wrap renderTasks to restore after each render
const originalRenderTasks = window.dashboard?.renderTasks;
if (originalRenderTasks) {
    window.dashboard.renderTasks = function() {
        originalRenderTasks.call(this);

        // Always restore colors and expansions after rendering
        setTimeout(() => {
            if (this.restoreTaskColors) {
                this.restoreTaskColors();
            }
            if (this.restoreExpandedGroups) {
                this.restoreExpandedGroups();
            }
        }, 50);
    };
}

// ===== END OF FIXED INITIALIZATION =====

// ===== END OF INITIALIZATION CODE =====