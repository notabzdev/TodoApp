// Group Task Management and Subtask Functionality
// Extend the TaskFlowDashboard class with group task features

Object.assign(TaskFlowDashboard.prototype, {
    // Override createTaskHTML to handle group tasks differently
    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const typeClass = task.type === 'group' ? 'task-group' : 'task-individual';
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

        if (task.type === 'group') {
            return this.createGroupTaskHTML(task);
        } else {
            return this.createIndividualTaskHTML(task);
        }
    },

    createIndividualTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';

        return `
            <div class="task-card task-individual ${priorityClass} ${completedClass}" data-task-id="${task.id}">
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
                    <span class="task-type">📋 Task</span>
                </div>
            </div>
        `;
    },

    createGroupTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
        const subtasks = task.subtasks || [];
        const completedSubtasks = subtasks.filter(st => st.completed).length;
        const totalSubtasks = subtasks.length;
        const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        return `
            <div class="task-card task-group ${priorityClass} ${completedClass}" data-task-id="${task.id}">
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

                <div class="edit-controls">
                    <button class="save-btn" title="Save Changes"></button>
                    <button class="cancel-btn" title="Cancel Editing"></button>
                </div>
                
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    ${dueDate ? `<span class="task-due-date">📅 ${dueDate}</span>` : ''}
                    <span class="task-type">📁 Group</span>
                </div>

                <button class="group-expand-btn" data-group-id="${task.id}" title="Expand/Collapse Subtasks">
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
                <span class="subtask-text" contenteditable="false">${this.escapeHtml(subtask.title)}</span>
                <div class="subtask-actions">
                    <button class="subtask-action-btn edit-subtask-btn" title="Edit Subtask">✏️</button>
                    <button class="subtask-action-btn delete-subtask-btn" title="Delete Subtask">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    // Enhanced setupTaskEventListeners to include group functionality
    setupTaskEventListeners() {
        // Call the original method first
        this.setupOriginalTaskEventListeners();

        // Add group-specific event listeners
        this.setupGroupTaskEventListeners();
    },

    setupOriginalTaskEventListeners() {
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
    },

    setupGroupTaskEventListeners() {
        // Group expand/collapse buttons
        document.querySelectorAll('.group-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupId = btn.dataset.groupId;
                this.toggleGroupExpansion(groupId);
            });
        });

        // Add subtask buttons
        document.querySelectorAll('.add-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupId = btn.dataset.groupId;
                this.showSubtaskForm(groupId);
            });
        });

        // Subtask form handlers
        document.querySelectorAll('.subtask-form').forEach(form => {
            const saveBtn = form.querySelector('.subtask-save-btn');
            const cancelBtn = form.querySelector('.subtask-cancel-btn');
            const input = form.querySelector('.subtask-input');
            const groupId = form.dataset.groupId;

            saveBtn.addEventListener('click', () => {
                this.saveSubtask(groupId, input.value.trim());
            });

            cancelBtn.addEventListener('click', () => {
                this.hideSubtaskForm(groupId);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveSubtask(groupId, input.value.trim());
                } else if (e.key === 'Escape') {
                    this.hideSubtaskForm(groupId);
                }
            });
        });

        // Subtask completion toggles
        document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskItem = checkbox.closest('.subtask-item');
                const subtaskId = subtaskItem.dataset.subtaskId;
                this.toggleSubtaskComplete(subtaskId);
            });
        });

        // Subtask inline editing
        document.querySelectorAll('.subtask-text').forEach(text => {
            text.addEventListener('click', (e) => {
                if (!text.hasAttribute('contenteditable') || text.getAttribute('contenteditable') === 'false') {
                    this.startSubtaskEdit(text);
                }
            });
        });

        // Subtask action buttons
        document.querySelectorAll('.edit-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskItem = btn.closest('.subtask-item');
                const textElement = subtaskItem.querySelector('.subtask-text');
                this.startSubtaskEdit(textElement);
            });
        });

        document.querySelectorAll('.delete-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskItem = btn.closest('.subtask-item');
                const subtaskId = subtaskItem.dataset.subtaskId;
                this.deleteSubtask(subtaskId);
            });
        });
    },

    toggleGroupExpansion(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        const subtasksContainer = taskCard.querySelector('.subtasks-container');
        const expandBtn = taskCard.querySelector('.group-expand-btn');

        if (subtasksContainer.classList.contains('expanded')) {
            // Collapse
            subtasksContainer.classList.remove('expanded');
            expandBtn.classList.remove('expanded');
            expandBtn.innerHTML = '▼';
            expandBtn.title = 'Expand Subtasks';
        } else {
            // Expand
            subtasksContainer.classList.add('expanded');
            expandBtn.classList.add('expanded');
            expandBtn.innerHTML = '▲';
            expandBtn.title = 'Collapse Subtasks';
        }
    },

    showSubtaskForm(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        const form = taskCard.querySelector('.subtask-form');
        const input = form.querySelector('.subtask-input');

        form.classList.add('active');
        input.focus();
    },

    hideSubtaskForm(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        const form = taskCard.querySelector('.subtask-form');
        const input = form.querySelector('.subtask-input');

        form.classList.remove('active');
        input.value = '';
    },

    async saveSubtask(groupId, title) {
        if (!title) {
            alert('Please enter a subtask title');
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

            if (!response.ok) {
                throw new Error('Failed to create subtask');
            }

            const result = await response.json();
            console.log('Subtask created:', result);

            // Reload tasks to get updated data
            await this.loadTasks();
            this.hideSubtaskForm(groupId);
            this.showNotification('Subtask added successfully!', 'success');

        } catch (error) {
            console.error('Error creating subtask:', error);
            this.showNotification('Failed to add subtask. Please try again.', 'error');
        }
    },

    async toggleSubtaskComplete(subtaskId) {
        try {
            const response = await fetch(`/api/subtasks/${subtaskId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': localStorage.getItem('sessionToken')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to toggle subtask');
            }

            // Reload tasks to get updated data
            await this.loadTasks();
            this.showNotification('Subtask updated!', 'success');

        } catch (error) {
            console.error('Error toggling subtask:', error);
            this.showNotification('Failed to update subtask. Please try again.', 'error');
        }
    },

    async deleteSubtask(subtaskId) {
        if (!confirm('Are you sure you want to delete this subtask?')) {
            return;
        }

        try {
            const response = await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('sessionToken')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete subtask');
            }

            // Reload tasks to get updated data
            await this.loadTasks();
            this.showNotification('Subtask deleted successfully!', 'success');

        } catch (error) {
            console.error('Error deleting subtask:', error);
            this.showNotification('Failed to delete subtask. Please try again.', 'error');
        }
    },

    startSubtaskEdit(textElement) {
        const originalText = textElement.textContent;
        textElement.setAttribute('contenteditable', 'true');
        textElement.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const saveEdit = async () => {
            const newTitle = textElement.textContent.trim();
            const subtaskItem = textElement.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.subtaskId;

            if (!newTitle) {
                alert('Subtask title cannot be empty');
                textElement.textContent = originalText;
                textElement.focus();
                return;
            }

            if (newTitle === originalText) {
                textElement.setAttribute('contenteditable', 'false');
                return;
            }

            try {
                const response = await fetch(`/api/subtasks/${subtaskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('sessionToken')
                    },
                    body: JSON.stringify({ title: newTitle })
                });

                if (!response.ok) {
                    throw new Error('Failed to update subtask');
                }

                textElement.setAttribute('contenteditable', 'false');
                this.showNotification('Subtask updated!', 'success');

            } catch (error) {
                console.error('Error updating subtask:', error);
                textElement.textContent = originalText;
                textElement.setAttribute('contenteditable', 'false');
                this.showNotification('Failed to update subtask. Please try again.', 'error');
            }
        };

        const cancelEdit = () => {
            textElement.textContent = originalText;
            textElement.setAttribute('contenteditable', 'false');
            textElement.blur();
        };

        // Create event handlers
        const keydownHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                textElement.removeEventListener('keydown', keydownHandler);
                textElement.removeEventListener('blur', blurHandler);
                saveEdit();
            } else if (e.key === 'Escape') {
                textElement.removeEventListener('keydown', keydownHandler);
                textElement.removeEventListener('blur', blurHandler);
                cancelEdit();
            }
        };

        const blurHandler = () => {
            textElement.removeEventListener('keydown', keydownHandler);
            textElement.removeEventListener('blur', blurHandler);
            saveEdit();
        };

        textElement.addEventListener('keydown', keydownHandler);
        textElement.addEventListener('blur', blurHandler);
    },

    // Override loadTasks to include subtasks
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

            // Load subtasks for group tasks
            await this.loadSubtasksForGroupTasks();

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
    },

    async loadSubtasksForGroupTasks() {
        const groupTasks = this.tasks.filter(task => task.type === 'group');

        for (const groupTask of groupTasks) {
            try {
                const response = await fetch(`/api/tasks/${groupTask.id}/subtasks`, {
                    headers: {
                        'Authorization': localStorage.getItem('sessionToken')
                    }
                });

                if (response.ok) {
                    const subtasksData = await response.json();
                    groupTask.subtasks = subtasksData.subtasks || [];
                } else {
                    groupTask.subtasks = [];
                }
            } catch (error) {
                console.error(`Error loading subtasks for task ${groupTask.id}:`, error);
                groupTask.subtasks = [];
            }
        }
    },

    // Utility function to calculate group task completion
    calculateGroupProgress(subtasks) {
        if (!subtasks || subtasks.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }

        const completed = subtasks.filter(st => st.completed).length;
        const total = subtasks.length;
        const percentage = (completed / total) * 100;

        return { completed, total, percentage };
    },

    // Auto-expand group tasks that have active subtasks being edited
    autoExpandGroupIfNeeded(groupId) {
        const taskCard = document.querySelector(`[data-task-id="${groupId}"]`);
        if (taskCard) {
            const subtasksContainer = taskCard.querySelector('.subtasks-container');
            if (!subtasksContainer.classList.contains('expanded')) {
                this.toggleGroupExpansion(groupId);
            }
        }
    },

    // Enhanced filter functionality to include subtask content
    filterTasksIncludingSubtasks(activeFilters) {
        let filteredTasks = [...this.tasks];

        if (!activeFilters.includes('all')) {
            filteredTasks = this.tasks.filter(task => {
                // Check task-level filters
                for (let filter of activeFilters) {
                    switch (filter) {
                        case 'completed':
                            if (task.completed) return true;
                            // Also check if it's a group with all subtasks completed
                            if (task.type === 'group' && task.subtasks && task.subtasks.length > 0) {
                                const allSubtasksCompleted = task.subtasks.every(st => st.completed);
                                if (allSubtasksCompleted) return true;
                            }
                            break;
                        case 'in-progress':
                            if (!task.completed) return true;
                            // Also check if it's a group with some but not all subtasks completed
                            if (task.type === 'group' && task.subtasks && task.subtasks.length > 0) {
                                const someCompleted = task.subtasks.some(st => st.completed);
                                const allCompleted = task.subtasks.every(st => st.completed);
                                if (someCompleted && !allCompleted) return true;
                            }
                            break;
                        case 'high-priority':
                            if (task.priority === 'high') return true;
                            break;
                    }
                }
                return false;
            });
        }

        return filteredTasks;
    },

    // Auto-collapse all group tasks on page load for cleaner interface
    initializeGroupTaskStates() {
        // This will be called after tasks are loaded and rendered
        setTimeout(() => {
            document.querySelectorAll('.task-group').forEach(groupCard => {
                const subtasksContainer = groupCard.querySelector('.subtasks-container');
                if (subtasksContainer && !subtasksContainer.classList.contains('expanded')) {
                    // Ensure all groups start collapsed
                    subtasksContainer.classList.remove('expanded');
                }
            });
        }, 100);
    }
});

// Initialize group task expansion state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for smooth transitions if not already present
    if (!document.querySelector('#group-task-styles')) {
        const style = document.createElement('style');
        style.id = 'group-task-styles';
        style.textContent = `
            .subtasks-container {
                transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
            }
            .group-expand-btn {
                transition: transform 0.3s ease, background-color 0.3s ease;
            }
            .subtask-item {
                transition: transform 0.2s ease, background-color 0.2s ease;
            }
            .empty-subtasks {
                text-align: center;
                color: var(--text-secondary);
                font-style: italic;
                padding: 1rem;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }
});