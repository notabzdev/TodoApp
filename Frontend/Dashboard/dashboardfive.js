// ===== COMPLETE FLUID MODE FEATURES =====
// Replace ENTIRE dashboardfive.js with this

Object.assign(TaskFlowDashboard.prototype, {
    // ========== DRAGGING ==========
    makeTasksDraggable() {
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => this.makeSingleTaskDraggable(task));
        console.log(`Made ${tasks.length} tasks draggable`);
    },

    makeSingleTaskDraggable(taskElement) {
        if (taskElement._isDraggable) return;

        // Check if task is pinned
        if (taskElement.classList.contains('pinned')) {
            taskElement.style.cursor = 'not-allowed';
            taskElement.title = 'Task is pinned - right-click to unpin';
            return; // Don't make pinned tasks draggable
        }

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        const handleMouseDown = (e) => {
            // Don't drag pinned tasks
            if (taskElement.classList.contains('pinned')) {
                return;
            }

            // Don't drag if clicking interactive elements
            if (e.target.closest('button') ||
                e.target.closest('input') ||
                e.target.closest('textarea') ||
                e.target.closest('.resize-handle-fluid') ||
                e.target.closest('[contenteditable="true"]')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(taskElement.style.left) || 0;
            initialTop = parseInt(taskElement.style.top) || 0;

            taskElement.classList.add('dragging');
            taskElement.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';

            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            // Constrain to container
            const container = document.querySelector('.tasks-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const taskWidth = taskElement.offsetWidth;
                const taskHeight = taskElement.offsetHeight;

                const padding = 10;
                newLeft = Math.max(padding, Math.min(newLeft, containerRect.width - taskWidth - padding));
                newTop = Math.max(padding, Math.min(newTop, containerRect.height - taskHeight - padding));
            }

            taskElement.style.left = newLeft + 'px';
            taskElement.style.top = newTop + 'px';

            this.checkTaskCollisions(taskElement);
        };

        const handleMouseUp = () => {
            if (!isDragging) return;

            isDragging = false;
            taskElement.classList.remove('dragging');
            taskElement.style.cursor = 'grab';
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            this.saveTaskPosition(taskElement);

            document.querySelectorAll('.task-card').forEach(t => {
                t.classList.remove('collision-warning', 'being-hovered', 'hovering-over-task');
            });
        };

        taskElement.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        taskElement._cleanupDraggable = () => {
            taskElement.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        taskElement._isDraggable = true;
        taskElement.style.cursor = 'grab';
    },

    checkTaskCollisions(draggedTask) {
        const draggedRect = draggedTask.getBoundingClientRect();
        let hasCollision = false;

        document.querySelectorAll('.task-card').forEach(task => {
            if (task === draggedTask) return;

            const taskRect = task.getBoundingClientRect();

            const isColliding = !(
                draggedRect.right < taskRect.left ||
                draggedRect.left > taskRect.right ||
                draggedRect.bottom < taskRect.top ||
                draggedRect.top > taskRect.bottom
            );

            if (isColliding) {
                hasCollision = true;
                task.classList.add('being-hovered');
                draggedTask.classList.add('hovering-over-task');
            } else {
                task.classList.remove('being-hovered');
            }
        });

        if (hasCollision) {
            draggedTask.classList.add('collision-warning');
        } else {
            draggedTask.classList.remove('collision-warning', 'hovering-over-task');
        }
    },

    // ========== WIDTH + HEIGHT RESIZE ==========
    addFluidResizeHandle(taskCard) {
        // Remove any old handles
        const oldHandles = taskCard.querySelectorAll('.resize-handle, .resize-handle-fluid');
        oldHandles.forEach(h => h.remove());

        // Create bi-directional handle
        const handle = document.createElement('div');
        handle.className = 'resize-handle-fluid';
        handle.innerHTML = '⋰';
        handle.title = 'Drag to resize';

        const dimensions = document.createElement('div');
        dimensions.className = 'resize-dimensions';
        dimensions.style.cssText = `
            position: absolute;
            top: -35px;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            opacity: 0;
            pointer-events: none;
            z-index: 101;
            transition: opacity 0.2s;
        `;

        taskCard.appendChild(handle);
        taskCard.appendChild(dimensions);

        const isGroup = taskCard.classList.contains('task-group');
        const minHeight = isGroup ? 250 : 180;
        const maxHeight = 800;
        const minWidth = 250;
        const maxWidth = 800;

        let isResizing = false;
        let startX, startY, initialWidth, initialHeight;

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            initialWidth = taskCard.offsetWidth;
            initialHeight = taskCard.offsetHeight;

            handle.classList.add('resizing');
            taskCard.classList.add('resizing');
            document.body.style.cursor = 'nwse-resize';
            document.body.style.userSelect = 'none';
            dimensions.style.opacity = '1';

            console.log(`Starting resize from: ${initialWidth}×${initialHeight}px`);
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = initialWidth + deltaX;
            let newHeight = initialHeight + deltaY;

            // Apply constraints
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

            // CRITICAL: Apply to the element
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

            const finalWidth = taskCard.offsetWidth;
            const finalHeight = taskCard.offsetHeight;

            console.log(`✅ Resized to: ${finalWidth}×${finalHeight}px`);

            this.saveFluidTaskSize(taskCard, finalWidth, finalHeight);

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        handle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    },

    saveFluidTaskSize(taskCard, width, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        if (!this.fluidTaskSizes) {
            this.fluidTaskSizes = new Map();
        }

        this.fluidTaskSizes.set(taskId, { width, height, timestamp: Date.now(), userId: this.currentUser.id });

        const key = `taskflow-fluid-sizes-${this.currentUser.id}`;
        const data = Object.fromEntries(this.fluidTaskSizes);
        localStorage.setItem(key, JSON.stringify(data));

        console.log(`💾 Fluid size saved: ${width}×${height}px`);
    },

    loadFluidTaskSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        const key = `taskflow-fluid-sizes-${this.currentUser.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const data = JSON.parse(saved);
                const sizeData = data[taskId];

                if (sizeData) {
                    taskCard.style.width = sizeData.width + 'px';
                    taskCard.style.height = sizeData.height + 'px';
                    console.log(`📂 Loaded fluid size: ${sizeData.width}×${sizeData.height}px`);
                }
            } catch (error) {
                console.error('Error loading fluid sizes:', error);
            }
        }
    },

    // ========== POSITIONING ==========
    saveTaskPosition(taskElement) {
        const taskId = taskElement.dataset.taskId;
        const position = {
            x: parseInt(taskElement.style.left) || 0,
            y: parseInt(taskElement.style.top) || 0,
            timestamp: Date.now(),
            userId: this.currentUser?.id || 'unknown'
        };

        this.taskPositions.set(taskId, position);
        this.saveTaskPositionsToStorage();
    },

    loadTaskPositions() {
        const tasks = document.querySelectorAll('.task-card');

        if (tasks.length === 0) return;

        let positionsLoaded = 0;
        let autoPositioned = 0;

        tasks.forEach((task, index) => {
            const taskId = task.dataset.taskId;
            const savedPosition = this.taskPositions.get(taskId);

            task.style.position = 'absolute';

            if (savedPosition) {
                task.style.left = savedPosition.x + 'px';
                task.style.top = savedPosition.y + 'px';
                positionsLoaded++;
            } else {
                const x = 100 + (autoPositioned * 50);
                const y = 100 + (autoPositioned * 50);

                task.style.left = x + 'px';
                task.style.top = y + 'px';

                autoPositioned++;
            }
        });

        console.log(`Loaded ${positionsLoaded} saved positions, auto-positioned ${autoPositioned} tasks`);

        this.reEnhanceFluidTasks();
    },

    reEnhanceFluidTasks() {
        setTimeout(() => {
            const taskCards = document.querySelectorAll('.task-card');

            taskCards.forEach(card => {
                // Add FLUID resize (bi-directional)
                if (!card.querySelector('.resize-handle-fluid')) {
                    this.addFluidResizeHandle(card);
                    this.loadFluidTaskSize(card);
                }

                if (!card._contextMenuHandler && this.addContextMenuToTask) {
                    this.addContextMenuToTask(card);
                }

                if (!card.dataset.enhanced && this.enhanceTaskCard) {
                    this.enhanceTaskCard(card);
                }
            });

            if (this.loadPinnedStates) {
                this.loadPinnedStates();
            }

            console.log(`✨ Re-enhanced ${taskCards.length} fluid tasks (width + height resize enabled)`);
        }, 100);
    },

    removeTaskDraggable() {
        document.querySelectorAll('.task-card').forEach(task => {
            if (task._cleanupDraggable) {
                task._cleanupDraggable();
                delete task._cleanupDraggable;
                delete task._isDraggable;
            }
            task.style.position = '';
            task.style.left = '';
            task.style.top = '';
            task.style.cursor = '';
            task.classList.remove('dragging', 'collision-warning', 'being-hovered', 'hovering-over-task');
        });
    },

    resetTaskPositions() {
        if (!confirm('Reset all task positions?')) return;

        this.taskPositions.clear();
        this.saveTaskPositionsToStorage();

        if (this.fluidModeEnabled && this.applyFluidFilter) {
            this.applyFluidFilter(this.activeFilter);
        }

        if (this.showNotification) {
            this.showNotification('Positions reset!', 'success');
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard) {
            const originalRenderTasks = window.dashboard.renderTasks;

            if (originalRenderTasks && !window.dashboard._fluidRenderHooked) {
                window.dashboard._fluidRenderHooked = true;

                window.dashboard.renderTasks = function() {
                    originalRenderTasks.call(this);

                    if (this.fluidModeEnabled) {
                        setTimeout(() => {
                            if (this.makeTasksDraggable) this.makeTasksDraggable();
                            if (this.loadTaskPositions) this.loadTaskPositions();
                        }, 100);
                    }
                };

                console.log('✅ Fluid mode render hook installed');
            }
        }
    }, 1100);
});