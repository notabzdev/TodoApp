// Dashboard Task Management Functions - Part 2
// Extend the TaskFlowDashboard class with additional methods

// Task Modal and CRUD Operations
Object.assign(TaskFlowDashboard.prototype, {
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
    },

    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.add('hidden');
        document.getElementById('taskForm').reset();
        this.editingTaskId = null;
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
});