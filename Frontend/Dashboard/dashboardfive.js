// ===== FLUID MODE - OPTIMIZED =====

Object.assign(TaskFlowDashboard.prototype, {
    // ========== DRAGGING ==========
    makeTasksDraggable() {
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => this.makeSingleTaskDraggable(task));
    },

    makeSingleTaskDraggable(taskElement) {
        if (taskElement._isDraggable || taskElement.classList.contains('pinned')) {
            if (taskElement.classList.contains('pinned')) {
                taskElement.style.cursor = 'not-allowed';
                taskElement.title = 'Pinned - right-click to unpin';
            }
            return;
        }

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let lastValidPosition = { left: 0, top: 0 }; // Store last valid position

        const onMouseDown = (e) => {
            if (taskElement.classList.contains('pinned') ||
                e.target.closest('button, input, textarea, .resize-handle-fluid, [contenteditable="true"]')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(taskElement.style.left) || 0;
            initialTop = parseInt(taskElement.style.top) || 0;

            // Store current position as last valid
            lastValidPosition = { left: initialLeft, top: initialTop };

            taskElement.classList.add('dragging');
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            let newLeft = initialLeft + (e.clientX - startX);
            let newTop = initialTop + (e.clientY - startY);

            const container = document.querySelector('.tasks-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                const padding = 10;
                newLeft = Math.max(padding, Math.min(newLeft, rect.width - taskElement.offsetWidth - padding));
                newTop = Math.max(padding, Math.min(newTop, rect.height - taskElement.offsetHeight - padding));
            }

            taskElement.style.left = newLeft + 'px';
            taskElement.style.top = newTop + 'px';

            const hasCollision = this.checkTaskCollisions(taskElement);

            // If no collision, update last valid position
            if (!hasCollision) {
                lastValidPosition = { left: newLeft, top: newTop };
            }
        };

        const onMouseUp = () => {
            if (!isDragging) return;

            const hasCollision = this.checkTaskCollisions(taskElement);

            // If there's a collision on release, return to last valid position with shake
            if (hasCollision) {
                taskElement.style.left = lastValidPosition.left + 'px';
                taskElement.style.top = lastValidPosition.top + 'px';

                // Add shake animation
                taskElement.classList.add('collision-shake');
                taskElement.style.border = '2px solid #ef4444';

                setTimeout(() => {
                    taskElement.classList.remove('collision-shake');
                    taskElement.style.border = '';
                }, 600);

                if (this.showNotification) {
                    this.showNotification('Cannot overlap tasks', 'error');
                }
            }

            isDragging = false;
            taskElement.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            this.saveTaskPosition(taskElement);

            document.querySelectorAll('.task-card').forEach(t => {
                t.classList.remove('collision-warning', 'being-hovered', 'hovering-over-task');
            });
        };

        taskElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        taskElement._cleanupDraggable = () => {
            taskElement.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
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
            const isColliding = !(draggedRect.right < taskRect.left || draggedRect.left > taskRect.right ||
                draggedRect.bottom < taskRect.top || draggedRect.top > taskRect.bottom);

            if (isColliding) {
                hasCollision = true;
                task.classList.add('being-hovered');
                draggedTask.classList.add('hovering-over-task');
            } else {
                task.classList.remove('being-hovered');
            }
        });

        draggedTask.classList.toggle('collision-warning', hasCollision);
        if (!hasCollision) draggedTask.classList.remove('hovering-over-task');

        return hasCollision; // Return collision state
    },

    // ========== RESIZE ==========
    addFluidResizeHandle(taskCard) {
        const oldElements = taskCard.querySelectorAll('.resize-handle, .resize-handle-fluid, .resize-dimensions');
        oldElements.forEach(el => el.remove());

        const style = window.getComputedStyle(taskCard);
        const minHeight = parseInt(style.height) || 200;
        const minWidth = parseInt(style.width) || 300;

        const handle = document.createElement('div');
        handle.className = 'resize-handle-fluid';
        handle.innerHTML = '⋰';
        handle.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 20px;
            height: 20px;
            cursor: nwse-resize;
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        `;

        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            bottom: calc(100% + 5px);
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            opacity: 0;
            pointer-events: none;
            z-index: 101;
            white-space: nowrap;
            width: auto !important;
            min-width: auto !important;
            max-width: none !important;
            display: inline-block;
        `;

        taskCard.appendChild(handle);
        taskCard.appendChild(tooltip);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        taskCard.addEventListener('mouseenter', () => !isResizing && (handle.style.opacity = '0.7'));
        taskCard.addEventListener('mouseleave', () => !isResizing && (handle.style.opacity = '0'));

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = taskCard.offsetWidth;
            startHeight = taskCard.offsetHeight;

            handle.style.opacity = '1';
            document.body.style.cursor = 'nwse-resize';
            document.body.style.userSelect = 'none';
            tooltip.style.opacity = '1';

            const onMove = (e) => {
                if (!isResizing) return;

                let width = Math.max(minWidth, Math.min(800, startWidth + (e.clientX - startX)));
                let height = Math.max(minHeight, Math.min(800, startHeight + (e.clientY - startY)));

                taskCard.style.width = width + 'px';
                taskCard.style.height = height + 'px';
                tooltip.textContent = `${Math.round(width)} × ${Math.round(height)}px`;
                tooltip.style.background = (width <= minWidth || height <= minHeight) ?
                    'rgba(239, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.9)';
            };

            const onUp = () => {
                if (!isResizing) return;
                isResizing = false;
                handle.style.opacity = '0';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                tooltip.style.opacity = '0';
                tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
                this.saveFluidTaskSize(taskCard, taskCard.offsetWidth, taskCard.offsetHeight);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        handle.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
        });
    },

    saveFluidTaskSize(taskCard, width, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        if (!this.fluidTaskSizes) this.fluidTaskSizes = new Map();
        this.fluidTaskSizes.set(taskId, { width, height, timestamp: Date.now(), userId: this.currentUser.id });

        const key = `taskflow-fluid-sizes-${this.currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(Object.fromEntries(this.fluidTaskSizes)));
    },

    loadFluidTaskSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        try {
            const key = `taskflow-fluid-sizes-${this.currentUser.id}`;
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const size = data[taskId];

            if (size) {
                taskCard.style.width = size.width + 'px';
                taskCard.style.height = size.height + 'px';
            }
        } catch (error) {
            console.error('Error loading sizes:', error);
        }
    },

    // ========== POSITIONING ==========
    saveTaskPosition(taskElement) {
        const taskId = taskElement.dataset.taskId;
        if (!taskId) return;

        this.taskPositions.set(taskId, {
            x: parseInt(taskElement.style.left) || 0,
            y: parseInt(taskElement.style.top) || 0,
            timestamp: Date.now(),
            userId: this.currentUser?.id || 'unknown'
        });
        this.saveTaskPositionsToStorage();
    },

    loadTaskPositions() {
        const tasks = document.querySelectorAll('.task-card');
        if (!tasks.length) return;

        let loaded = 0;
        tasks.forEach((task, i) => {
            const pos = this.taskPositions.get(task.dataset.taskId);
            task.style.position = 'absolute';

            if (pos) {
                task.style.left = pos.x + 'px';
                task.style.top = pos.y + 'px';
                loaded++;
            } else {
                task.style.left = (100 + i * 50) + 'px';
                task.style.top = (100 + i * 50) + 'px';
            }
        });

        this.reEnhanceFluidTasks();
    },

    reEnhanceFluidTasks() {
        setTimeout(() => {
            document.querySelectorAll('.task-card').forEach(card => {
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
            if (this.loadPinnedStates) this.loadPinnedStates();
        }, 100);
    },

    removeTaskDraggable() {
        document.querySelectorAll('.task-card').forEach(task => {
            if (task._cleanupDraggable) {
                task._cleanupDraggable();
                delete task._cleanupDraggable;
                delete task._isDraggable;
            }
            task.style.cssText = '';
            task.classList.remove('dragging', 'collision-warning', 'being-hovered', 'hovering-over-task');
        });
    },

    resetTaskPositions() {
        if (!confirm('Reset all positions?')) return;
        this.taskPositions.clear();
        this.saveTaskPositionsToStorage();
        if (this.fluidModeEnabled && this.applyFluidFilter) {
            this.applyFluidFilter(this.activeFilter);
        }
        if (this.showNotification) {
            this.showNotification('Positions reset', 'success');
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard) {
            const original = window.dashboard.renderTasks;
            if (original && !window.dashboard._fluidHooked) {
                window.dashboard._fluidHooked = true;
                window.dashboard.renderTasks = function() {
                    original.call(this);
                    if (this.fluidModeEnabled) {
                        setTimeout(() => {
                            if (this.makeTasksDraggable) this.makeTasksDraggable();
                            if (this.loadTaskPositions) this.loadTaskPositions();
                        }, 100);
                    }
                };
            }
        }
    }, 1100);
});