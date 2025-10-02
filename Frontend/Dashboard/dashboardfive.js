// Fluid Mode Dragging and Positioning - dashboardfive.js
// Task dragging, collision detection, and positioning functionality

Object.assign(TaskFlowDashboard.prototype, {
    makeTasksDraggable() {
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => this.makeSingleTaskDraggable(task));
    },

    makeSingleTaskDraggable(taskElement) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let animationFrame = null;

        const positionInfo = document.createElement('div');
        positionInfo.className = 'task-position-info';
        taskElement.appendChild(positionInfo);

        const handleMouseDown = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
                return;
            }

            isDragging = true;
            this.draggedTask = taskElement;

            const rect = taskElement.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            this.lastValidPosition = {
                x: parseInt(taskElement.style.left) || 0,
                y: parseInt(taskElement.style.top) || 0
            };

            taskElement.classList.add('dragging');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                const workspace = document.querySelector('.workspace');
                const workspaceRect = workspace.getBoundingClientRect();

                newX = newX - workspaceRect.left;
                newY = newY - workspaceRect.top - 80;

                const maxX = workspaceRect.width - taskElement.offsetWidth;
                const maxY = workspaceRect.height - 80 - taskElement.offsetHeight;

                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                if (this.isGridVisible) {
                    newX = Math.round(newX / this.gridSize) * this.gridSize;
                    newY = Math.round(newY / this.gridSize) * this.gridSize;
                }

                const screenX = newX + workspaceRect.left;
                const screenY = newY + workspaceRect.top + 80;

                const hoveredTask = this.getHoveredTask(screenX, screenY, taskElement);
                const wouldCollide = this.checkCollisions(screenX, screenY, taskElement);

                this.updateHoverStates(hoveredTask, taskElement);

                taskElement.style.left = newX + 'px';
                taskElement.style.top = newY + 'px';

                taskElement.classList.toggle('collision-warning', wouldCollide);

                positionInfo.textContent = `${Math.round(newX)}, ${Math.round(newY)}`;
            });
        };

        const handleMouseUp = () => {
            if (!isDragging) return;

            isDragging = false;
            this.draggedTask = null;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            const workspace = document.querySelector('.workspace');
            const workspaceRect = workspace.getBoundingClientRect();
            const currentX = parseInt(taskElement.style.left) + workspaceRect.left;
            const currentY = parseInt(taskElement.style.top) + workspaceRect.top + 80;

            const wouldCollide = this.checkCollisions(currentX, currentY, taskElement);

            if (wouldCollide) {
                this.shakeAndReturnTask(taskElement);
            } else {
                this.lastValidPosition = {
                    x: parseInt(taskElement.style.left),
                    y: parseInt(taskElement.style.top)
                };
                this.saveTaskPosition(taskElement);
            }

            taskElement.classList.remove('dragging', 'collision-warning');
            this.clearAllHoverStates();
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        taskElement.addEventListener('mousedown', handleMouseDown);
        taskElement.style.cursor = 'grab';

        taskElement._cleanupDraggable = () => {
            taskElement.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (positionInfo.parentNode) positionInfo.remove();
        };
    },

    getHoveredTask(x, y, draggingTask) {
        const tasks = document.querySelectorAll('.task-card:not(.dragging)');

        for (let task of tasks) {
            const rect = task.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return task;
            }
        }
        return null;
    },

    updateHoverStates(hoveredTask, draggingTask) {
        this.clearAllHoverStates();

        if (hoveredTask) {
            hoveredTask.classList.add('being-hovered');
            draggingTask.classList.add('hovering-over-task');
            this.isHoveringOverTask = true;
        } else {
            this.isHoveringOverTask = false;
        }
    },

    clearAllHoverStates() {
        document.querySelectorAll('.task-card').forEach(task => {
            task.classList.remove('being-hovered', 'hovering-over-task');
        });
        this.isHoveringOverTask = false;
    },

    shakeAndReturnTask(taskElement) {
        taskElement.classList.add('shake-animation');

        taskElement.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        taskElement.style.left = this.lastValidPosition.x + 'px';
        taskElement.style.top = this.lastValidPosition.y + 'px';

        setTimeout(() => {
            taskElement.classList.remove('shake-animation');
            taskElement.style.transition = '';
        }, 600);

        this.showNotification('Cannot place task there - position blocked!', 'error');
    },

    checkCollisions(x, y, taskElement) {
        const taskRect = {
            left: x,
            top: y,
            right: x + taskElement.offsetWidth,
            bottom: y + taskElement.offsetHeight
        };

        const otherTasks = document.querySelectorAll('.task-card:not(.dragging)');

        for (let otherTask of otherTasks) {
            const otherRect = otherTask.getBoundingClientRect();
            const otherBounds = {
                left: otherRect.left - this.collisionPadding,
                top: otherRect.top - this.collisionPadding,
                right: otherRect.right + this.collisionPadding,
                bottom: otherRect.bottom + this.collisionPadding
            };

            if (taskRect.left < otherBounds.right &&
                taskRect.right > otherBounds.left &&
                taskRect.top < otherBounds.bottom &&
                taskRect.bottom > otherBounds.top) {
                return true;
            }
        }

        return false;
    },

    removeTaskDraggable() {
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => {
            if (task._cleanupDraggable) {
                task._cleanupDraggable();
                delete task._cleanupDraggable;
            }
            task.style.position = '';
            task.style.left = '';
            task.style.top = '';
            task.style.cursor = '';
            task.style.transition = '';
            task.classList.remove('dragging', 'collision-warning', 'being-hovered', 'hovering-over-task');
        });
    },

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

        console.log(`Position saved for task ${taskId}:`, position);
    },

    loadTaskPositions() {
        const tasks = document.querySelectorAll('.task-card');
        const workspace = document.querySelector('.workspace');
        const workspaceRect = workspace?.getBoundingClientRect();

        if (!workspaceRect) {
            console.warn('Workspace not found, deferring position loading');
            setTimeout(() => this.loadTaskPositions(), 100);
            return;
        }

        let positionsLoaded = 0;
        const occupiedPositions = new Set();

        tasks.forEach((task) => {
            const taskId = task.dataset.taskId;
            const savedPosition = this.taskPositions.get(taskId);

            if (savedPosition && this.isValidPosition(savedPosition, workspaceRect)) {
                const posKey = `${savedPosition.x},${savedPosition.y}`;
                if (!occupiedPositions.has(posKey)) {
                    task.style.position = 'absolute';
                    task.style.left = savedPosition.x + 'px';
                    task.style.top = savedPosition.y + 'px';
                    occupiedPositions.add(posKey);
                    positionsLoaded++;
                    console.log(`Loaded position for task ${taskId}:`, savedPosition);
                } else {
                    console.log(`Position conflict for task ${taskId}, will auto-position`);
                }
            }
        });

        let autoPositionIndex = 0;
        tasks.forEach((task) => {
            const taskId = task.dataset.taskId;
            const savedPosition = this.taskPositions.get(taskId);
            const posKey = savedPosition ? `${savedPosition.x},${savedPosition.y}` : null;

            if (!savedPosition || !this.isValidPosition(savedPosition, workspaceRect) ||
                (posKey && occupiedPositions.has(posKey) && task.style.position !== 'absolute')) {
                this.autoPositionTask(task, autoPositionIndex, occupiedPositions);
                autoPositionIndex++;
            }
        });

        console.log(`Loaded ${positionsLoaded} saved positions, auto-positioned ${autoPositionIndex} tasks`);
    },

    isValidPosition(position, workspaceRect) {
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            return false;
        }

        if (workspaceRect) {
            const maxX = workspaceRect.width - 300;
            const maxY = workspaceRect.height - 200;

            if (position.x < 0 || position.y < 0 || position.x > maxX || position.y > maxY) {
                return false;
            }
        }

        return true;
    },

    autoPositionTask(task, index, occupiedPositions = new Set()) {
        const workspace = document.querySelector('.workspace');
        const workspaceRect = workspace.getBoundingClientRect();

        const taskWidth = task.classList.contains('task-group') ? 400 : 300;
        const taskHeight = task.classList.contains('task-group') ? 280 : 200;
        const padding = 20;

        // Account for floating action bar space (7rem = ~112px)
        const availableWidth = workspaceRect.width - 112 - padding;
        const cols = Math.floor(availableWidth / (taskWidth + padding));
        let row = Math.floor(index / cols);
        let col = index % cols;

        let attempts = 0;
        let positioned = false;

        while (!positioned && attempts < 100) {
            const x = col * (taskWidth + padding) + padding + 112; // Add space for floating bar
            const y = row * (taskHeight + padding) + padding;
            const posKey = `${x},${y}`;

            if (!occupiedPositions.has(posKey)) {
                task.style.position = 'absolute';
                task.style.left = x + 'px';
                task.style.top = y + 'px';
                occupiedPositions.add(posKey);
                this.saveTaskPosition(task);
                positioned = true;
                console.log(`Auto-positioned task ${task.dataset.taskId} at ${x}, ${y}`);
            } else {
                col++;
                if (col >= cols) {
                    col = 0;
                    row++;
                }
                attempts++;
            }
        }

        if (!positioned) {
            console.warn(`Failed to auto-position task ${task.dataset.taskId} after ${attempts} attempts`);
        }
    },

    resetTaskPositions() {
        const tasks = document.querySelectorAll('.task-card');
        const occupiedPositions = new Set();

        this.taskPositions.clear();
        this.saveTaskPositionsToStorage();

        tasks.forEach((task, index) => {
            this.autoPositionTask(task, index, occupiedPositions);
        });

        this.showNotification('Task positions reset with micro-precision.', 'info');
    },

    autoArrangeTasks() {
        const tasks = Array.from(document.querySelectorAll('.task-card'));

        tasks.forEach(task => {
            task.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        const workspace = document.querySelector('.workspace');
        const workspaceRect = workspace.getBoundingClientRect();

        const individualTasks = tasks.filter(task => !task.classList.contains('task-group'));
        const groupTasks = tasks.filter(task => task.classList.contains('task-group'));

        let currentY = 20;
        const occupiedPositions = new Set();

        if (groupTasks.length > 0) {
            const availableWidth = workspaceRect.width - 112 - 20; // Account for floating bar
            const groupCols = Math.floor(availableWidth / 420);
            groupTasks.forEach((task, index) => {
                const row = Math.floor(index / groupCols);
                const col = index % groupCols;

                const x = col * 420 + 20 + 112; // Add space for floating bar
                const y = currentY + row * 300;

                task.style.left = x + 'px';
                task.style.top = y + 'px';
                occupiedPositions.add(`${x},${y}`);
                this.saveTaskPosition(task);
            });

            currentY += Math.ceil(groupTasks.length / groupCols) * 300 + 20;
        }

        if (individualTasks.length > 0) {
            const availableWidth = workspaceRect.width - 112 - 20;
            const individualCols = Math.floor(availableWidth / 320);

            individualTasks.forEach((task, index) => {
                const row = Math.floor(index / individualCols);
                const col = index % individualCols;

                const x = col * 320 + 20 + 112; // Add space for floating bar
                const y = currentY + row * 220;

                task.style.left = x + 'px';
                task.style.top = y + 'px';
                occupiedPositions.add(`${x},${y}`);
                this.saveTaskPosition(task);
            });
        }

        setTimeout(() => {
            tasks.forEach(task => {
                task.style.transition = '';
            });
        }, 400);

        this.showNotification('Tasks arranged with precision!', 'success');
    }
});

// Enhance the original renderTasks function to support fluid mode
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard) {
            const originalRenderTasks = window.dashboard.renderTasks;
            window.dashboard.renderTasks = function() {
                originalRenderTasks.call(this);

                if (this.fluidModeEnabled) {
                    setTimeout(() => {
                        this.makeTasksDraggable();
                        this.loadTaskPositions();
                    }, 100);
                }
            };
        }
    }, 1100);
});