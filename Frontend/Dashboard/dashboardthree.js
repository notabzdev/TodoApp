

Object.assign(TaskFlowDashboard.prototype, {

    // ========== TASK HTML GENERATION ==========
    createTaskHTML(task) {
        const colorStyle = task.color ? `style="background: ${task.color} !important;"` : '';
        return task.type === 'group' ?
            this.createGroupTaskHTML(task, colorStyle) :
            this.createIndividualTaskHTML(task, colorStyle);
    },

    createIndividualTaskHTML(task, colorStyle = '') {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

        return `
            <div class="task-card task-individual ${priorityClass} ${completedClass}" 
                 data-task-id="${task.id}"
                 ${colorStyle}>
                <div class="task-header">
                    <div class="task-left">
                        <button class="task-action-btn complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                            ${task.completed ? '✓' : ''}
                        </button>
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-btn" title="Edit Task">✏️</button>
                        <button class="task-action-btn delete-btn" title="Delete Task">🗑️</button>
                    </div>
                </div>
                
                ${task.description ?
            `<p class="task-description">${this.escapeHtml(task.description)}</p>` :
            `<p class="task-description"><em style="opacity: 0.5;">No description</em></p>`
        }
                
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    ${dueDate ? `<span class="task-due-date">📅 ${dueDate}</span>` : ''}
                    <span class="task-type">📋 Task</span>
                </div>
            </div>
        `;
    },

    createGroupTaskHTML(task, colorStyle = '') {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
        const subtasks = task.subtasks || [];
        const completedSubtasks = subtasks.filter(st => st.completed).length;
        const totalSubtasks = subtasks.length;
        const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        // Check if this group should be expanded
        const isExpanded = this.expandedGroups && this.expandedGroups.has(String(task.id));

        return `
            <div class="task-card task-group ${priorityClass} ${completedClass}" 
                 data-task-id="${task.id}"
                 data-natural-height="auto"
                 ${colorStyle}>
                <div class="task-header">
                    <div class="task-left">
                        <button class="task-action-btn complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                            ${task.completed ? '✓' : ''}
                        </button>
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-btn" title="Edit Task">✏️</button>
                        <button class="task-action-btn delete-btn" title="Delete Task">🗑️</button>
                    </div>
                </div>
                
                ${task.description ?
            `<p class="task-description">${this.escapeHtml(task.description)}</p>` :
            `<p class="task-description"><em style="opacity: 0.5;">No description</em></p>`
        }
                
                <div class="group-progress">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${completedSubtasks}/${totalSubtasks} completed</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="subtasks-container ${isExpanded ? 'expanded' : ''}" data-group-id="${task.id}">
                    <div class="subtasks-header">
                        <div class="subtasks-title">
                            Subtasks
                            <span class="subtasks-count">${totalSubtasks}</span>
                        </div>
                        <button class="add-subtask-btn" data-group-id="${task.id}">
                            + Add Subtask
                        </button>
                    </div>
                    
                    <div class="subtask-form" data-group-id="${task.id}">
                        <input type="text" class="subtask-input" placeholder="Enter subtask title..." maxlength="100">
                        <div class="subtask-form-actions">
                            <button class="subtask-save-btn">Save</button>
                            <button class="subtask-cancel-btn">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="subtasks-list">
                        ${this.createSubtasksHTML(subtasks)}
                    </div>
                </div>

                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    ${dueDate ? `<span class="task-due-date">📅 ${dueDate}</span>` : ''}
                    <span class="task-type">📂 Group</span>
                </div>

                <button class="group-expand-btn ${isExpanded ? 'expanded' : ''}" 
                        data-group-id="${task.id}" 
                        title="Expand/Collapse">▼</button>
            </div>
        `;
    },

    createSubtasksHTML(subtasks) {
        if (!subtasks || subtasks.length === 0) {
            return '<div class="empty-subtasks">No subtasks yet. Click "Add Subtask" to get started.</div>';
        }

        return subtasks.map(subtask => `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}" data-subtask-id="${subtask.id}">
                <button class="subtask-checkbox" title="${subtask.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                    ${subtask.completed ? '✓' : ''}
                </button>
                <span class="subtask-text">${this.escapeHtml(subtask.title)}</span>
                <div class="subtask-actions">
                    <button class="subtask-action-btn delete-subtask-btn" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    // event LIsteners
    setupTaskEventListeners() {
        this.setupBasicTaskListeners();
        this.setupGroupTaskListeners();
    },

    setupBasicTaskListeners() {
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.toggleTaskComplete(taskId);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                const task = this.tasks.find(t => t.id == taskId);
                if (task) this.showTaskModal(false, task);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    },

    setupGroupTaskListeners() {
        // Expand/Collapse buttons
        document.querySelectorAll('.group-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleGroupExpansion(btn.dataset.groupId);
            });
        });

        // Add subtask buttons
        document.querySelectorAll('.add-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showSubtaskForm(btn.dataset.groupId);
            });
        });

        // Subtask forms
        document.querySelectorAll('.subtask-form').forEach(form => {
            const saveBtn = form.querySelector('.subtask-save-btn');
            const cancelBtn = form.querySelector('.subtask-cancel-btn');
            const input = form.querySelector('.subtask-input');
            const groupId = form.dataset.groupId;

            saveBtn.addEventListener('click', () => this.saveSubtask(groupId, input.value.trim()));
            cancelBtn.addEventListener('click', () => this.hideSubtaskForm(groupId));

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveSubtask(groupId, input.value.trim());
                } else if (e.key === 'Escape') {
                    this.hideSubtaskForm(groupId);
                }
            });
        });

        // Subtask checkboxes
        document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSubtaskComplete(checkbox.closest('.subtask-item').dataset.subtaskId);
            });
        });

        // Delete subtask buttons
        document.querySelectorAll('.delete-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSubtask(btn.closest('.subtask-item').dataset.subtaskId);
            });
        });
    },

    //Group expansion
    toggleGroupExpansion(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        if (!taskCard) return;

        const container = taskCard.querySelector('.subtasks-container');
        const btn = taskCard.querySelector('.group-expand-btn');

        if (!container || !btn) return;

        const isExpanded = container.classList.contains('expanded');

        if (isExpanded) {
            this.collapseGroup(groupId, taskCard, container, btn);
        } else {
            this.expandGroup(groupId, taskCard, container, btn);
        }
    },

    collapseGroup(groupId, taskCard, container, btn) {
        if (this.expandedGroups) {
            this.expandedGroups.delete(String(groupId));
            this.saveExpandedGroups();
        }

        container.classList.remove('expanded');
        btn.innerHTML = '▼';
        btn.classList.remove('expanded');
        taskCard.style.height = '';

        console.log('Group collapsed:', groupId);
    },

    expandGroup(groupId, taskCard, container, btn) {
        if (!this.expandedGroups) {
            this.expandedGroups = new Set();
        }
        this.expandedGroups.add(String(groupId));
        this.saveExpandedGroups();

        container.classList.add('expanded');
        btn.innerHTML = '▲';
        btn.classList.add('expanded');
        taskCard.style.height = '';

        console.log('Group expanded:', groupId);
    },

    //Subtaskform
    showSubtaskForm(groupId) {
        const form = document.querySelector(`.subtask-form[data-group-id="${groupId}"]`);
        if (!form) return;
        form.classList.add('active');
        form.querySelector('.subtask-input').focus();
    },

    hideSubtaskForm(groupId) {
        const form = document.querySelector(`.subtask-form[data-group-id="${groupId}"]`);
        if (!form) return;
        form.classList.remove('active');
        form.querySelector('.subtask-input').value = '';
    },

    // ========== SUBTASK CRUD (FIXED WITH SIZE PRESERVATION) ==========
    async saveSubtask(groupId, title) {
        if (!title) {
            this.showNotification('Please enter a subtask title', 'error');
            return;
        }

        try {
            // CRITICAL: Capture state BEFORE reload
            const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
            const currentWidth = taskCard ? taskCard.offsetWidth : null;
            const currentHeight = taskCard ? taskCard.offsetHeight : null;
            const wasExpanded = taskCard?.querySelector('.subtasks-container')?.classList.contains('expanded');

            console.log('Saving state before reload:', {
                groupId,
                width: currentWidth,
                height: currentHeight,
                wasExpanded
            });

            const response = await fetch('/api/subtasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('sessionToken')
                },
                body: JSON.stringify({
                    parentTaskId: parseInt(groupId),
                    title: title
                })
            });

            if (!response.ok) throw new Error('Failed to create subtask');

            await this.loadTasks();

            // CRITICAL: Restore state AFTER reload
            setTimeout(() => {
                const updatedCard = document.querySelector(`[data-task-id="${groupId}"]`);

                if (updatedCard && currentWidth && currentHeight) {
                    updatedCard.style.width = currentWidth + 'px';
                    updatedCard.style.height = currentHeight + 'px';

                    console.log('Restored size:', { width: currentWidth, height: currentHeight });

                    // Save based on mode
                    if (this.fluidModeEnabled) {
                        if (this.saveFluidTaskSize) {
                            this.saveFluidTaskSize(updatedCard, currentWidth, currentHeight);
                        }
                    } else {
                        if (this.saveBidirectionalSize) {
                            this.saveBidirectionalSize(updatedCard, currentWidth, currentHeight);
                        } else if (this.taskSizes) {
                            this.taskSizes.set(groupId, {
                                width: currentWidth,
                                height: currentHeight,
                                timestamp: Date.now(),
                                userId: this.currentUser?.id
                            });
                            if (this.saveTaskSizesToStorage) {
                                this.saveTaskSizesToStorage();
                            }
                        }
                    }

                    // Restore expansion
                    if (wasExpanded) {
                        const container = updatedCard.querySelector('.subtasks-container');
                        const btn = updatedCard.querySelector('.group-expand-btn');

                        if (container && !container.classList.contains('expanded')) {
                            container.classList.add('expanded');
                        }
                        if (btn && !btn.classList.contains('expanded')) {
                            btn.classList.add('expanded');
                            btn.innerHTML = '▲';
                        }

                        console.log('Restored expansion state');
                    }
                }
            }, 150);

            this.hideSubtaskForm(groupId);
            this.showNotification('Subtask added', 'success');

        } catch (error) {
            console.error('Error creating subtask:', error);
            this.showNotification('Failed to add subtask', 'error');
        }
    },

    async toggleSubtaskComplete(subtaskId) {
        try {
            // Find group and save state
            const subtaskItem = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
            const taskCard = subtaskItem?.closest('.task-card');
            const groupId = taskCard?.dataset.taskId;

            const currentWidth = taskCard ? taskCard.offsetWidth : null;
            const currentHeight = taskCard ? taskCard.offsetHeight : null;
            const wasExpanded = taskCard?.querySelector('.subtasks-container')?.classList.contains('expanded');

            const response = await fetch(`/api/subtasks/${subtaskId}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': localStorage.getItem('sessionToken') }
            });

            if (!response.ok) throw new Error('Failed to toggle subtask');

            await this.loadTasks();

            // Restore state
            if (groupId && currentWidth && currentHeight) {
                setTimeout(() => {
                    const updatedCard = document.querySelector(`[data-task-id="${groupId}"]`);
                    if (updatedCard) {
                        updatedCard.style.width = currentWidth + 'px';
                        updatedCard.style.height = currentHeight + 'px';

                        if (this.fluidModeEnabled && this.saveFluidTaskSize) {
                            this.saveFluidTaskSize(updatedCard, currentWidth, currentHeight);
                        } else if (this.saveBidirectionalSize) {
                            this.saveBidirectionalSize(updatedCard, currentWidth, currentHeight);
                        }

                        if (wasExpanded) {
                            const container = updatedCard.querySelector('.subtasks-container');
                            const btn = updatedCard.querySelector('.group-expand-btn');
                            if (container) container.classList.add('expanded');
                            if (btn) {
                                btn.classList.add('expanded');
                                btn.innerHTML = '▲';
                            }
                        }
                    }
                }, 150);
            }

            this.showNotification('Subtask updated', 'success');

        } catch (error) {
            console.error('Error toggling subtask:', error);
            this.showNotification('Failed to update subtask', 'error');
        }
    },

    async deleteSubtask(subtaskId) {
        if (!confirm('Delete this subtask?')) return;

        try {
            // Find group and save state
            const subtaskItem = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
            const taskCard = subtaskItem?.closest('.task-card');
            const groupId = taskCard?.dataset.taskId;

            const currentWidth = taskCard ? taskCard.offsetWidth : null;
            const currentHeight = taskCard ? taskCard.offsetHeight : null;
            const wasExpanded = taskCard?.querySelector('.subtasks-container')?.classList.contains('expanded');

            const response = await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': localStorage.getItem('sessionToken') }
            });

            if (!response.ok) throw new Error('Failed to delete subtask');

            await this.loadTasks();

            // Restore state
            if (groupId && currentWidth && currentHeight) {
                setTimeout(() => {
                    const updatedCard = document.querySelector(`[data-task-id="${groupId}"]`);
                    if (updatedCard) {
                        updatedCard.style.width = currentWidth + 'px';
                        updatedCard.style.height = currentHeight + 'px';

                        if (this.fluidModeEnabled && this.saveFluidTaskSize) {
                            this.saveFluidTaskSize(updatedCard, currentWidth, currentHeight);
                        } else if (this.saveBidirectionalSize) {
                            this.saveBidirectionalSize(updatedCard, currentWidth, currentHeight);
                        }

                        if (wasExpanded) {
                            const container = updatedCard.querySelector('.subtasks-container');
                            const btn = updatedCard.querySelector('.group-expand-btn');
                            if (container) container.classList.add('expanded');
                            if (btn) {
                                btn.classList.add('expanded');
                                btn.innerHTML = '▲';
                            }
                        }
                    }
                }, 150);
            }

            this.showNotification('Subtask deleted', 'success');

        } catch (error) {
            console.error('Error deleting subtask:', error);
            this.showNotification('Failed to delete subtask', 'error');
        }
    },

    // data loading
    async loadTasks() {
        if (this.isLoadingTasks) return;
        this.isLoadingTasks = true;

        try {
            const response = await fetch('/api/tasks', {
                headers: { 'Authorization': localStorage.getItem('sessionToken') }
            });

            if (!response.ok) throw new Error(`Failed to load tasks: ${response.status}`);

            const data = await response.json();
            this.tasks = data.tasks || [];

            await this.loadSubtasksForGroupTasks();

            console.log('Tasks loaded from server:', this.tasks);

            this.updateFilterCounts();
            this.renderTasks();

        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.updateFilterCounts();
            this.renderTasks();
        } finally {
            this.isLoadingTasks = false;
        }
    },

    async loadSubtasksForGroupTasks() {
        const groupTasks = this.tasks.filter(task => task.type === 'group');

        for (const groupTask of groupTasks) {
            try {
                const response = await fetch(`/api/tasks/${groupTask.id}/subtasks`, {
                    headers: { 'Authorization': localStorage.getItem('sessionToken') }
                });

                groupTask.subtasks = response.ok ? (await response.json()).subtasks || [] : [];
            } catch (error) {
                console.error(`Error loading subtasks for task ${groupTask.id}:`, error);
                groupTask.subtasks = [];
            }
        }
    },

    // expansion
    saveExpandedGroups() {
        if (!this.expandedGroups || !this.currentUser) return;

        const key = `taskflow-expanded-groups-${this.currentUser.id}`;
        const data = Array.from(this.expandedGroups);
        localStorage.setItem(key, JSON.stringify(data));
        console.log('Saved expanded groups:', data);
    },

    loadExpandedGroups() {
        if (!this.currentUser) return;

        const key = `taskflow-expanded-groups-${this.currentUser.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.expandedGroups = new Set(data);
                console.log('Loaded expanded groups:', data);
            } catch (error) {
                console.error('Error loading expanded groups:', error);
                this.expandedGroups = new Set();
            }
        } else {
            this.expandedGroups = new Set();
        }
    },

    restoreExpandedGroups() {
        if (!this.expandedGroups) return;

        this.expandedGroups.forEach(groupId => {
            const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
            if (taskCard) {
                const container = taskCard.querySelector('.subtasks-container');
                const btn = taskCard.querySelector('.group-expand-btn');

                if (container && btn && !container.classList.contains('expanded')) {
                    container.classList.add('expanded');
                    btn.classList.add('expanded');
                    btn.innerHTML = '▲';
                }
            }
        });
    }
});

//init
document.addEventListener('DOMContentLoaded', () => {
    const initGroups = () => {
        if (window.dashboard) {
            if (!window.dashboard.expandedGroups) {
                window.dashboard.loadExpandedGroups();
            }
            // Ensure resize tracking is initialized
            if (!window.dashboard.taskSizes) {
                window.dashboard.taskSizes = new Map();
            }
            console.log('✅ Group tasks initialized');
        } else {
            setTimeout(initGroups, 500);
        }
    };
    setTimeout(initGroups, 1000);
});