// Dashboard JavaScript - Main Class and Core Functionality
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
                taskColor: 'rgba(248, 250, 252, 0.7)'
            },
            {
                id: 'corporate',
                name: 'Corporate',
                description: 'Clean, professional interface',
                headerColor: '#3b82f6',
                bgGradient: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                taskColor: 'rgba(30, 41, 59, 0.7)'
            },
            {
                id: 'nature',
                name: 'Nature',
                description: 'Earthy tones with organic feel',
                headerColor: '#84cc16',
                bgGradient: 'linear-gradient(135deg, #fefdf8, #f0f4e8)',
                taskColor: 'rgba(54, 83, 20, 0.7)'
            },
            {
                id: 'dark',
                name: 'Dark Mode',
                description: 'Sleek dark interface, easy on the eyes',
                headerColor: '#8b5cf6',
                bgGradient: 'linear-gradient(135deg, #111827, #1f2937)',
                taskColor: 'rgba(209, 213, 219, 0.7)'
            }
        ];

        themeOptions.innerHTML = themes.map(theme => `
            <div class="theme-card" data-theme="${theme.id}">
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