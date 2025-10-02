// Task Resize Functionality - FIXED VERSION
// Add to TaskFlowDashboard prototype with proper event handling

Object.assign(TaskFlowDashboard.prototype, {
    initTaskResize() {
        this.taskSizes = new Map();
        this.loadTaskSizesFromStorage();
        console.log('Task resize functionality initialized');
    },

    addResizeHandle(taskCard) {
        // Skip if already has resize handle
        if (taskCard.querySelector('.resize-handle')) return;

        // Create resize handle
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.innerHTML = '⋱⋱';

        // Create dimensions display
        const dimensions = document.createElement('div');
        dimensions.className = 'resize-dimensions';

        // Set up task card
        taskCard.style.position = 'relative';
        taskCard.appendChild(handle);
        taskCard.appendChild(dimensions);

        // Resize state variables
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;
        let animationFrame = null;

        // Get constraints
        const isGroup = taskCard.classList.contains('task-group');
        const minHeight = isGroup ? 250 : 180;
        const maxHeight = isGroup ? 600 : 400;

        // Show/hide handle on hover
        taskCard.addEventListener('mouseenter', () => {
            if (!isResizing) {
                handle.style.opacity = '0.7';
            }
        });

        taskCard.addEventListener('mouseleave', () => {
            if (!isResizing) {
                handle.style.opacity = '0';
            }
        });

        // Enhanced mouse down handler
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            startY = e.clientY;
            startHeight = taskCard.offsetHeight;

            // Visual feedback
            handle.classList.add('resizing');
            handle.style.opacity = '1';
            taskCard.classList.add('resizing');
            taskCard.style.transition = 'none';
            taskCard.style.userSelect = 'none';

            // Set cursor globally
            document.body.style.cursor = 'se-resize';
            document.body.style.userSelect = 'none';

            // Show dimensions
            dimensions.style.opacity = '1';
            dimensions.textContent = `${taskCard.offsetWidth} × ${startHeight}px`;

            // Mouse move handler with throttling
            const handleMouseMove = (e) => {
                if (!isResizing) return;

                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }

                animationFrame = requestAnimationFrame(() => {
                    const deltaY = e.clientY - startY;
                    let newHeight = startHeight + deltaY;

                    // Apply constraints
                    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

                    // Apply new height
                    taskCard.style.height = newHeight + 'px';
                    dimensions.textContent = `${taskCard.offsetWidth} × ${newHeight}px`;
                });
            };

            // Mouse up handler
            const handleMouseUp = () => {
                if (!isResizing) return;

                isResizing = false;

                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }

                // Clean up visual state
                handle.classList.remove('resizing');
                taskCard.classList.remove('resizing');
                taskCard.style.transition = '';
                taskCard.style.userSelect = '';

                // Reset cursor
                document.body.style.cursor = '';
                document.body.style.userSelect = '';

                // Hide dimensions and handle
                dimensions.style.opacity = '0';
                handle.style.opacity = '0';

                // Save the new size
                const finalHeight = taskCard.offsetHeight;
                this.saveTaskSize(taskCard, finalHeight);

                console.log(`Task ${taskCard.dataset.taskId} resized to ${finalHeight}px`);

                // Remove event listeners
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            // Add event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        // Prevent handle from interfering with other interactions
        handle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        handle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Cleanup function
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

        console.log(`Saved size for task ${taskId}:`, sizeData);
    },

    loadTaskSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.taskSizes) return;

        const savedSize = this.taskSizes.get(taskId);
        if (savedSize && savedSize.height) {
            taskCard.style.height = savedSize.height + 'px';
            console.log(`Loaded size for task ${taskId}: ${savedSize.height}px`);
        }
    },

    saveTaskSizesToStorage() {
        if (!this.currentUser || !this.taskSizes) return;

        try {
            const key = `taskflow-task-sizes-${this.currentUser.id}`;
            const sizes = Object.fromEntries(this.taskSizes);
            localStorage.setItem(key, JSON.stringify(sizes));
            console.log(`Saved ${this.taskSizes.size} task sizes to storage`);
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
                const sizes = JSON.parse(saved);
                this.taskSizes = new Map(Object.entries(sizes));
                console.log(`Loaded ${this.taskSizes.size} task sizes from storage`);
            } else {
                this.taskSizes = new Map();
            }
        } catch (error) {
            console.error('Error loading task sizes:', error);
            this.taskSizes = new Map();
        }
    },

    resetTaskSize(taskId) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskCard) return;

        // Remove saved size
        this.taskSizes.delete(taskId);
        this.saveTaskSizesToStorage();

        // Reset visual size
        taskCard.style.height = '';

        // Add transition for smooth reset
        taskCard.style.transition = 'height 0.3s ease';
        setTimeout(() => {
            taskCard.style.transition = '';
        }, 300);

        console.log(`Reset size for task ${taskId}`);
    },

    resetAllTaskSizes() {
        if (!confirm('Reset all task sizes to default?')) return;

        // Clear storage
        this.taskSizes.clear();
        this.saveTaskSizesToStorage();

        // Reset all visible tasks
        document.querySelectorAll('.task-card').forEach(card => {
            card.style.height = '';
            card.style.transition = 'height 0.3s ease';
        });

        // Clean up transitions
        setTimeout(() => {
            document.querySelectorAll('.task-card').forEach(card => {
                card.style.transition = '';
            });
        }, 300);

        console.log('All task sizes reset');

        if (this.showNotification) {
            this.showNotification('All task sizes reset to default', 'info');
        }
    },

    // Enhanced task rendering to include resize functionality
    enhanceTaskWithResize(taskCard) {
        this.addResizeHandle(taskCard);
        this.loadTaskSize(taskCard);
    },

    // Cleanup function for removing resize functionality
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

            // Override renderFilteredTasks to add resize functionality
            const originalRender = window.dashboard.renderFilteredTasks;
            window.dashboard.renderFilteredTasks = function(filteredTasks) {
                originalRender.call(this, filteredTasks);

                // Add resize functionality after tasks are rendered
                setTimeout(() => {
                    document.querySelectorAll('.task-card').forEach(card => {
                        this.enhanceTaskWithResize(card);
                    });
                }, 100);
            };

            console.log('Task resize system active');
        } else {
            setTimeout(initResize, 1000);
        }
    };

    setTimeout(initResize, 2000);
});