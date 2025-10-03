// Group Task Management and Subtask Functionality
// Optimized version with color persistence

Object.assign(TaskFlowDashboard.prototype, {
    // Override createTaskHTML to handle group tasks with color support
    createTaskHTML(task) {
        // Apply saved color if it exists
        const colorStyle = task.color ? `style="background: ${task.color} !important;"` : '';

        if (task.type === 'group') {
            return this.createGroupTaskHTML(task, colorStyle);
        } else {
            return this.createIndividualTaskHTML(task, colorStyle);
        }
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

        return `
            <div class="task-card task-group ${priorityClass} ${completedClass}" 
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
                
                <div class="group-progress">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${completedSubtasks}/${totalSubtasks} completed</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="subtasks-container" data-group-id="${task.id}">
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
                    <span class="task-type">📁 Group</span>
                </div>

                <button class="group-expand-btn" data-group-id="${task.id}" title="Expand/Collapse">
                    ▼
                </button>
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

    // Enhanced setupTaskEventListeners
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
        document.querySelectorAll('.group-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupId = btn.dataset.groupId;
                this.toggleGroupExpansion(groupId);
            });
        });

        document.querySelectorAll('.add-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSubtaskForm(btn.dataset.groupId);
            });
        });

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

        document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskId = checkbox.closest('.subtask-item').dataset.subtaskId;
                this.toggleSubtaskComplete(subtaskId);
            });
        });

        document.querySelectorAll('.delete-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskId = btn.closest('.subtask-item').dataset.subtaskId;
                this.deleteSubtask(subtaskId);
            });
        });
    },

    toggleGroupExpansion(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        const container = taskCard.querySelector('.subtasks-container');
        const btn = taskCard.querySelector('.group-expand-btn');

        if (container.classList.contains('expanded')) {
            container.classList.remove('expanded');
            btn.innerHTML = '▼';
        } else {
            container.classList.add('expanded');
            btn.innerHTML = '▲';
        }
    },

    showSubtaskForm(groupId) {
        const form = document.querySelector(`.subtask-form[data-group-id="${groupId}"]`);
        const input = form.querySelector('.subtask-input');
        form.classList.add('active');
        input.focus();
    },

    hideSubtaskForm(groupId) {
        const form = document.querySelector(`.subtask-form[data-group-id="${groupId}"]`);
        const input = form.querySelector('.subtask-input');
        form.classList.remove('active');
        input.value = '';
    },

    async saveSubtask(groupId, title) {
        if (!title) {
            this.showNotification('Please enter a subtask title', 'error');
            return;
        }

        try {
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
            this.hideSubtaskForm(groupId);
            this.showNotification('Subtask added', 'success');

        } catch (error) {
            console.error('Error creating subtask:', error);
            this.showNotification('Failed to add subtask', 'error');
        }
    },

    async toggleSubtaskComplete(subtaskId) {
        try {
            const response = await fetch(`/api/subtasks/${subtaskId}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': localStorage.getItem('sessionToken') }
            });

            if (!response.ok) throw new Error('Failed to toggle subtask');

            await this.loadTasks();
            this.showNotification('Subtask updated', 'success');

        } catch (error) {
            console.error('Error toggling subtask:', error);
            this.showNotification('Failed to update subtask', 'error');
        }
    },

    async deleteSubtask(subtaskId) {
        if (!confirm('Delete this subtask?')) return;

        try {
            const response = await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': localStorage.getItem('sessionToken') }
            });

            if (!response.ok) throw new Error('Failed to delete subtask');

            await this.loadTasks();
            this.showNotification('Subtask deleted', 'success');

        } catch (error) {
            console.error('Error deleting subtask:', error);
            this.showNotification('Failed to delete subtask', 'error');
        }
    },

    // Override loadTasks to include subtasks
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
    }
});