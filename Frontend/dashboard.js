// Dashboard JavaScript - Complete Updated Version with Fixed Checkbox
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

        // Load view preference
        this.loadViewPreference();

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

        // Filter checkboxes
        this.setupFilterListeners();
    }

    setupFilterListeners() {
        const filterOptions = document.querySelectorAll('.filter-option');

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
                    const allTasksFilter = document.querySelector('.filter-option[data-filter="all"]');
                    allTasksFilter.classList.remove('active');
                    allTasksFilter.querySelector('input').checked = false;
                }

                // If no filters are active, activate "All Tasks"
                const activeFilters = document.querySelectorAll('.filter-option.active');
                if (activeFilters.length === 0) {
                    const allTasksFilter = document.querySelector('.filter-option[data-filter="all"]');
                    allTasksFilter.classList.add('active');
                    allTasksFilter.querySelector('input').checked = true;
                }

                this.applyFilters();
            });
        });

        // Initialize active states and counts
        this.updateFilterCounts();
        this.initializeFilterStates();
    }

    initializeFilterStates() {
        const filterOptions = document.querySelectorAll('.filter-option');

        filterOptions.forEach(filterButton => {
            const checkbox = filterButton.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                filterButton.classList.add('active');
            }
        });
    }

    updateFilterCounts() {
        if (!this.tasks) {
            this.tasks = []; // Ensure tasks array exists
        }

        const counts = {
            all: this.tasks.length,
            completed: this.tasks.filter(task => task.completed).length,
            inProgress: this.tasks.filter(task => !task.completed).length,
            highPriority: this.tasks.filter(task => task.priority === 'high').length
        };

        console.log('Updating filter counts:', counts); // Debug log

        // Update badge counts
        const allCountEl = document.getElementById('allCount');
        const completedCountEl = document.getElementById('completedCount');
        const inProgressCountEl = document.getElementById('inProgressCount');
        const highPriorityCountEl = document.getElementById('highPriorityCount');

        if (allCountEl) allCountEl.textContent = counts.all;
        if (completedCountEl) completedCountEl.textContent = counts.completed;
        if (inProgressCountEl) inProgressCountEl.textContent = counts.inProgress;
        if (highPriorityCountEl) highPriorityCountEl.textContent = counts.highPriority;

        return counts;
    }

    applyFilters() {
        const activeFilterButtons = document.querySelectorAll('.filter-option.active');
        const activeFilters = Array.from(activeFilterButtons).map(btn => btn.dataset.filter);

        console.log('Active filters:', activeFilters);
        this.filterTasks(activeFilters);
    }

    filterTasks(activeFilters) {
        let filteredTasks = [...this.tasks];

        // If "All Tasks" is not in active filters, apply specific filters
        if (!activeFilters.includes('all')) {
            filteredTasks = this.tasks.filter(task => {
                // Check each active filter
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
                return false; // Task doesn't match any active filters
            });
        }

        // Update the display
        this.renderFilteredTasks(filteredTasks);

        // Update counter
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
        // Add or update counter in workspace header
        const workspaceHeader = document.querySelector('.workspace-header h2');

        if (filteredCount === totalCount) {
            workspaceHeader.textContent = `My Workspace (${totalCount} tasks)`;
        } else {
            workspaceHeader.textContent = `My Workspace (${filteredCount} of ${totalCount} tasks)`;
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

            // Update filter counts when tasks are loaded
            this.updateFilterCounts();

            // Render with current filters
            this.renderTasks();

        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.updateFilterCounts();
            this.renderTasks();
        }
    }

    renderTasks() {
        // Apply current filters instead of showing all tasks
        this.applyFilters();
    }

    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const typeClass = task.type === 'group' ? 'task-group' : 'task-individual';
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

        return `
            <div class="task-card ${typeClass} ${priorityClass} ${completedClass}" data-task-id="${task.id}">
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

    // Improved inline editing functions
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

        // Set up editing with better styling
        element.setAttribute('contenteditable', 'true');
        element.classList.add('editing');

        // Add editing indicator
        element.style.position = 'relative';

        // Focus with better UX
        element.focus();

        // Show edit controls with animation
        const editControls = taskCard.querySelector('.edit-controls');
        editControls.classList.add('active');

        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Add escape key handler for this specific edit session
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.cancelInlineEdit(element);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Store the escape handler for cleanup
        element._escapeHandler = escapeHandler;
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
            // Show error with better styling
            element.style.borderColor = '#ef4444';
            element.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';

            // Create error message
            let errorMsg = taskCard.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.cssText = `
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 4px;
                    border-left: 3px solid #ef4444;
                `;
                taskCard.appendChild(errorMsg);
            }
            errorMsg.textContent = 'Task title cannot be empty';

            // Remove error after 3 seconds
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    errorMsg.remove();
                }
            }, 3000);

            // Refocus the element
            element.focus();
            return;
        }

        // Add saving state
        const saveBtn = taskCard.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            saveBtn.style.opacity = '0.7';
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

            // Update filter counts in real-time
            this.updateFilterCounts();

            // Show success animation
            element.style.background = 'rgba(16, 185, 129, 0.2)';
            element.style.transition = 'background 0.3s ease';

            setTimeout(() => {
                element.style.background = '';
            }, 1000);

            // Clean up editing state
            this.finishInlineEdit(element);

            // Show success notification
            this.showNotification(`Task ${field} updated successfully!`, 'success');

            console.log(`Task ${field} updated successfully`);

        } catch (error) {
            console.error('Error updating task:', error);

            // Show error state
            element.style.borderColor = '#ef4444';
            element.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';

            // Create error notification
            this.showNotification('Failed to update task. Please try again.', 'error');

            this.cancelInlineEdit(element);
        } finally {
            // Reset save button
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = '';
                saveBtn.style.opacity = '1';
            }
        }
    }

    cancelInlineEdit(element) {
        const field = element.dataset.field;
        const originalValue = field === 'title' ? this.originalTaskData?.title : this.originalTaskData?.description;

        // Restore original content with animation
        element.style.transition = 'all 0.3s ease';
        element.style.background = 'rgba(239, 68, 68, 0.1)';

        setTimeout(() => {
            if (field === 'description' && !originalValue) {
                element.innerHTML = '<em style="opacity: 0.5;">Click to add description...</em>';
            } else {
                element.textContent = originalValue || '';
            }
            element.style.background = '';
        }, 150);

        this.finishInlineEdit(element);
    }

    finishInlineEdit(element) {
        const taskCard = element.closest('.task-card');

        // Remove editing state with animation
        element.setAttribute('contenteditable', 'false');
        element.classList.remove('editing');
        element.style.position = '';
        element.style.borderColor = '';
        element.style.boxShadow = '';

        // Hide edit controls with animation
        const editControls = taskCard.querySelector('.edit-controls');
        editControls.classList.remove('active');

        // Clean up escape handler
        if (element._escapeHandler) {
            document.removeEventListener('keydown', element._escapeHandler);
            delete element._escapeHandler;
        }

        // Clear stored data
        this.originalTaskData = null;

        // Remove any error messages
        const errorMsg = taskCard.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    // Add a notification system
    showNotification(message, type = 'info') {
        // Create notification element
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

        // Set colors based on type
        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 4 seconds
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

        // Update button states
        if (viewType === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }

        // Add transition effect
        tasksContainer.classList.add('switching-view');

        setTimeout(() => {
            // Update container class
            tasksContainer.classList.remove('grid-view', 'list-view');
            tasksContainer.classList.add(`${viewType}-view`);

            // Remove transition effect
            tasksContainer.classList.remove('switching-view');

            // Save preference
            localStorage.setItem('taskflow-view-preference', viewType);
        }, 150);

        console.log('View changed to:', viewType);
    }

    // Load view preference
    loadViewPreference() {
        const savedView = localStorage.getItem('taskflow-view-preference') || 'grid';
        this.setView(savedView);
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