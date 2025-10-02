

Object.assign(TaskFlowDashboard.prototype, {
    initTaskResize() {
        console.log('✅ Initializing task resize functionality');
        this.taskSizes = new Map();
        this.loadTaskSizesFromStorage();
    },

    addResizeHandle(taskCard) {
        // Prevent duplicate handles
        if (taskCard.querySelector('.resize-handle')) {
            return;
        }

        // Create handle element
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.innerHTML = '⋱⋱';
        handle.title = 'Drag to resize';

        // Create dimensions tooltip
        const dimensions = document.createElement('div');
        dimensions.className = 'resize-dimensions';

        // Append to task card
        taskCard.style.position = 'relative';
        taskCard.appendChild(handle);
        taskCard.appendChild(dimensions);

        // Get constraints based on task type
        const isGroup = taskCard.classList.contains('task-group');
        const minHeight = isGroup ? 250 : 180;
        const maxHeight = isGroup ? 600 : 400;

        // Resize state
        let isResizing = false;

        // Show/hide handle on hover
        taskCard.addEventListener('mouseenter', () => {
            if (!isResizing) {
                handle.style.opacity = '0.7';
            }
        });
// ===== ADD THESE FUNCTIONS TO YOUR resize.js FILE =====
// Place after the existing addResizeHandle function

// Enhanced resize with both width and height
        Object.assign(TaskFlowDashboard.prototype, {
            addBidirectionalResizeHandle(taskCard) {
                // Only in fluid mode or if you want it everywhere
                const isFluidMode = document.body.classList.contains('fluid-mode');

                // Remove old handle if exists
                const oldHandle = taskCard.querySelector('.resize-handle');
                if (oldHandle) oldHandle.remove();

                // Create new bi-directional handle
                const handle = document.createElement('div');
                handle.className = 'resize-handle-bidirectional';
                handle.innerHTML = '⋰';
                handle.title = 'Drag to resize width and height';

                const dimensions = document.createElement('div');
                dimensions.className = 'resize-dimensions';

                taskCard.appendChild(handle);
                taskCard.appendChild(dimensions);

                // Constraints
                const isGroup = taskCard.classList.contains('task-group');
                const minHeight = isGroup ? 250 : 180;
                const maxHeight = isGroup ? 600 : 400;
                const minWidth = 250;
                const maxWidth = 600;

                let isResizing = false;

                // Show/hide
                taskCard.addEventListener('mouseenter', () => {
                    if (!isResizing) handle.style.opacity = '0.7';
                });

                taskCard.addEventListener('mouseleave', () => {
                    if (!isResizing) handle.style.opacity = '0';
                });

                // Mouse down
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    isResizing = true;
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = taskCard.offsetWidth;
                    const startHeight = taskCard.offsetHeight;

                    // Visual feedback
                    handle.classList.add('resizing');
                    taskCard.classList.add('resizing');
                    document.body.style.cursor = 'nwse-resize';
                    document.body.style.userSelect = 'none';
                    dimensions.style.opacity = '1';

                    const handleMouseMove = (moveEvent) => {
                        if (!isResizing) return;

                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;

                        let newWidth = startWidth + deltaX;
                        let newHeight = startHeight + deltaY;

                        // Apply constraints
                        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
                        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

                        // Update size
                        taskCard.style.width = newWidth + 'px';
                        taskCard.style.height = newHeight + 'px';
                        dimensions.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}px`;
                    };

                    const handleMouseUp = () => {
                        if (!isResizing) return;

                        isResizing = false;
                        handle.classList.remove('resizing');
                        taskCard.classList.remove('resizing');
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        dimensions.style.opacity = '0';

                        // Save both dimensions
                        this.saveBidirectionalSize(taskCard, taskCard.offsetWidth, taskCard.offsetHeight);

                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                });

                handle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            },

            saveBidirectionalSize(taskCard, width, height) {
                const taskId = taskCard.dataset.taskId;
                if (!taskId || !this.currentUser) return;

                const sizeData = {
                    width: width,
                    height: height,
                    timestamp: Date.now(),
                    userId: this.currentUser.id
                };

                this.taskSizes.set(taskId, sizeData);
                this.saveTaskSizesToStorage();
            },

            loadBidirectionalSize(taskCard) {
                const taskId = taskCard.dataset.taskId;
                if (!taskId || !this.taskSizes) return;

                const savedSize = this.taskSizes.get(taskId);
                if (savedSize) {
                    if (savedSize.width) taskCard.style.width = savedSize.width + 'px';
                    if (savedSize.height) taskCard.style.height = savedSize.height + 'px';
                }
            }
        });
        taskCard.addEventListener('mouseleave', () => {
            if (!isResizing) {
                handle.style.opacity = '0';
            }
        });

        // Mouse down - start resizing
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            const startY = e.clientY;
            const startHeight = taskCard.offsetHeight;

            // Visual feedback
            handle.classList.add('resizing');
            taskCard.classList.add('resizing');
            handle.style.opacity = '1';
            document.body.style.cursor = 'se-resize';
            document.body.style.userSelect = 'none';
            taskCard.style.transition = 'none';

            // Show dimensions
            dimensions.style.opacity = '1';
            dimensions.textContent = `${taskCard.offsetWidth} × ${startHeight}px`;

            // Mouse move handler
            const handleMouseMove = (moveEvent) => {
                if (!isResizing) return;

                const deltaY = moveEvent.clientY - startY;
                let newHeight = startHeight + deltaY;

                // Apply constraints
                newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

                // Update height
                taskCard.style.height = newHeight + 'px';
                dimensions.textContent = `${taskCard.offsetWidth} × ${Math.round(newHeight)}px`;
            };

            // Mouse up handler
            const handleMouseUp = () => {
                if (!isResizing) return;

                isResizing = false;

                // Clean up visual state
                handle.classList.remove('resizing');
                taskCard.classList.remove('resizing');
                taskCard.style.transition = '';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                dimensions.style.opacity = '0';
                handle.style.opacity = '0';

                // Save the final size
                const finalHeight = taskCard.offsetHeight;
                this.saveTaskSize(taskCard, finalHeight);

                console.log(`Task ${taskCard.dataset.taskId} resized to ${finalHeight}px`);

                // Remove event listeners
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            // Attach event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        // Prevent handle from triggering other events
        handle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        handle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Store cleanup function
        taskCard._cleanupResize = () => {
            if (handle.parentNode) handle.remove();
            if (dimensions.parentNode) dimensions.remove();
            taskCard.style.height = '';
            taskCard.style.transition = '';
            taskCard.classList.remove('resizing');
        };
    },

    saveTaskSize(taskCard, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        const sizeData = {
            height: height,
            timestamp: Date.now(),
            userId: this.currentUser.id
        };

        this.taskSizes.set(taskId, sizeData);
        this.saveTaskSizesToStorage();
    },

    loadTaskSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.taskSizes) return;

        const savedSize = this.taskSizes.get(taskId);
        if (savedSize && savedSize.height) {
            taskCard.style.height = savedSize.height + 'px';
        }
    },

    saveTaskSizesToStorage() {
        if (!this.currentUser || !this.taskSizes) return;

        try {
            const key = `taskflow-task-sizes-${this.currentUser.id}`;
            const data = {};

            this.taskSizes.forEach((value, key) => {
                data[key] = value;
            });

            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving task sizes:', error);
        }
    },

    loadTaskSizesFromStorage() {
        if (!this.currentUser) return;

        try {
            const key = `taskflow-task-sizes-${this.currentUser.id}`;
            const saved = localStorage.getItem(key);

            if (saved) {
                const data = JSON.parse(saved);
                this.taskSizes = new Map(Object.entries(data));
                console.log(`Loaded ${this.taskSizes.size} saved task sizes`);
            } else {
                this.taskSizes = new Map();
            }
        } catch (error) {
            console.error('Error loading task sizes:', error);
            this.taskSizes = new Map();
        }
    },

    resetTaskSize(taskId) {
        if (!taskId) return;

        this.taskSizes.delete(taskId);
        this.saveTaskSizesToStorage();

        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.style.height = '';
        }

        if (this.showNotification) {
            this.showNotification('Task size reset', 'info');
        }
    },

    resetAllTaskSizes() {
        if (!confirm('Reset all task sizes to default?')) {
            return;
        }

        this.taskSizes.clear();
        this.saveTaskSizesToStorage();

        document.querySelectorAll('.task-card').forEach(card => {
            card.style.height = '';
        });

        if (this.showNotification) {
            this.showNotification('All task sizes reset to default', 'info');
        }
    },

    enhanceTaskWithResize(taskCard) {
        this.addResizeHandle(taskCard);
        this.loadTaskSize(taskCard);
    },

    removeTaskResize() {
        document.querySelectorAll('.task-card').forEach(card => {
            if (card._cleanupResize) {
                card._cleanupResize();
                delete card._cleanupResize;
            }
        });
    }
});

// Auto-initialize when dashboard is ready
document.addEventListener('DOMContentLoaded', () => {
    const initResize = () => {
        if (window.dashboard && window.dashboard.initTaskResize) {
            window.dashboard.initTaskResize();
            console.log('✅ Task resize system ready');
        } else {
            setTimeout(initResize, 500);
        }
    };

    setTimeout(initResize, 1000);
});