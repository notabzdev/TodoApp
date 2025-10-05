// ===== COMPLETE FLUID MODE SYSTEM - CONSOLIDATED =====
// Handles all fluid mode functionality: settings, dragging, resizing, collisions

Object.assign(TaskFlowDashboard.prototype, {

    // ========== INITIALIZATION ==========
    initFluidMode() {
        if (this.fluidModeInitialized) return;

        console.log('Initializing Fluid Mode...');

        this.fluidModeEnabled = false;
        this.isGridVisible = false;
        this.taskPositions = new Map();
        this.fluidTaskSizes = new Map();
        this.activeFilter = 'all';
        this.fluidModeInitialized = true;

        this.createFluidElements();
        this.setupFluidEventListeners();
        this.loadFluidSettings();
    },

    // ========== UI CREATION ==========
    createFluidElements() {
        if (document.getElementById('settingsModal')) return;

        // Settings Modal
        const settingsModal = document.createElement('div');
        settingsModal.id = 'settingsModal';
        settingsModal.className = 'settings-modal';
        settingsModal.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h2 class="settings-title">Settings</h2>
                    <button class="settings-close" id="closeSettings">&times;</button>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-section-title">Workspace</h3>
                    
                    <div class="settings-option">
                        <div class="settings-option-info">
                            <div class="settings-option-title">Fluid Mode</div>
                            <div class="settings-option-description">
                                Enable dynamic workspace with draggable tasks
                            </div>
                        </div>
                        <button class="toggle-switch" id="fluidModeToggle"></button>
                    </div>
                    
                    <div class="settings-option">
                        <div class="settings-option-info">
                            <div class="settings-option-title">Show Grid</div>
                            <div class="settings-option-description">
                                Display alignment grid overlay
                            </div>
                        </div>
                        <button class="toggle-switch" id="gridToggle"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        // Fluid Controls (bottom right buttons)
        const fluidControls = document.createElement('div');
        fluidControls.className = 'fluid-controls';
        fluidControls.innerHTML = `
            <button class="fluid-control-btn" id="toggleGrid" title="Toggle Grid">Grid</button>
            <button class="fluid-control-btn" id="resetPositions" title="Reset Positions">Reset</button>
        `;
        document.body.appendChild(fluidControls);

        // Grid Overlay
        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'fluid-grid-overlay';
        gridOverlay.id = 'fluidGridOverlay';
        document.body.appendChild(gridOverlay);
    },

    // ========== EVENT LISTENERS ==========
    setupFluidEventListeners() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn && !settingsBtn.dataset.fluidListener) {
            settingsBtn.addEventListener('click', () => this.showSettings());
            settingsBtn.dataset.fluidListener = 'true';
        }

        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.hideSettings());
        }

        const fluidModeToggle = document.getElementById('fluidModeToggle');
        if (fluidModeToggle) {
            fluidModeToggle.addEventListener('click', () => this.toggleFluidMode());
        }

        const gridToggle = document.getElementById('gridToggle');
        if (gridToggle) {
            gridToggle.addEventListener('click', () => this.toggleGrid());
        }

        const toggleGridBtn = document.getElementById('toggleGrid');
        if (toggleGridBtn) {
            toggleGridBtn.addEventListener('click', () => this.toggleGrid());
        }

        const resetBtn = document.getElementById('resetPositions');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPositions());
        }

        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideSettings();
            });
        }

        this.setupFloatingActionBar();
    },

    setupFloatingActionBar() {
        const setup = () => {
            const createBtn = document.getElementById('createTaskBtn');
            if (createBtn) {
                createBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showTaskModal(false);
                };
            }

            const filterMap = {
                'filterAllBtn': 'all',
                'filterCompletedBtn': 'completed',
                'filterInProgressBtn': 'in-progress',
                'filterHighPriorityBtn': 'high-priority'
            };

            Object.entries(filterMap).forEach(([btnId, filter]) => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        this.applyFluidFilter(filter);
                    };
                }
            });
        };

        setup();
        setTimeout(setup, 500);
    },

    // ========== SETTINGS MANAGEMENT ==========
    showSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('show');
            this.updateToggleStates();
        }
    },

    hideSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.classList.remove('show');
    },

    updateToggleStates() {
        const fluidToggle = document.getElementById('fluidModeToggle');
        const gridToggle = document.getElementById('gridToggle');

        if (fluidToggle) {
            fluidToggle.classList.toggle('active', this.fluidModeEnabled);
        }

        if (gridToggle) {
            gridToggle.classList.toggle('active', this.isGridVisible);
            gridToggle.disabled = !this.fluidModeEnabled;
            gridToggle.style.opacity = this.fluidModeEnabled ? '1' : '0.5';
        }
    },

    // ========== FLUID MODE TOGGLE ==========
    toggleFluidMode() {
        this.fluidModeEnabled = !this.fluidModeEnabled;
        console.log(`Fluid mode: ${this.fluidModeEnabled ? 'ENABLED' : 'DISABLED'}`);

        if (this.fluidModeEnabled) {
            this.enterFluidMode();
        } else {
            this.exitFluidMode();
        }

        this.updateToggleStates();
        this.saveFluidSettings();
    },

    enterFluidMode() {
        document.body.classList.add('fluid-mode-transitioning');

        setTimeout(() => {
            document.body.classList.add('fluid-mode');
            document.body.classList.remove('fluid-mode-transitioning');
        }, 50);

        setTimeout(() => {
            this.applyFluidFilter(this.activeFilter);
            this.setupFloatingActionBar();
        }, 300);

        this.showNotification('Fluid mode enabled!', 'success');
    },

    exitFluidMode() {
        document.body.classList.add('fluid-mode-transitioning');

        setTimeout(() => {
            document.body.classList.remove('fluid-mode');
            document.body.classList.remove('fluid-mode-transitioning');
            this.isGridVisible = false;

            const gridOverlay = document.getElementById('fluidGridOverlay');
            if (gridOverlay) gridOverlay.classList.remove('show');
        }, 50);

        this.removeDraggable();

        setTimeout(() => {
            this.renderTasks();
        }, 300);

        this.showNotification('Fluid mode disabled', 'info');
    },

    toggleGrid() {
        if (!this.fluidModeEnabled) {
            this.showNotification('Grid only available in Fluid Mode', 'info');
            return;
        }

        this.isGridVisible = !this.isGridVisible;

        const gridOverlay = document.getElementById('fluidGridOverlay');
        if (gridOverlay) {
            gridOverlay.classList.toggle('show', this.isGridVisible);
        }

        const gridBtn = document.getElementById('toggleGrid');
        if (gridBtn) {
            gridBtn.classList.toggle('active', this.isGridVisible);
        }

        this.updateToggleStates();
        this.saveFluidSettings();

        this.showNotification(
            this.isGridVisible ? 'Grid enabled' : 'Grid disabled',
            'info'
        );
    },

    // ========== FILTERING ==========
    applyFluidFilter(filterType) {
        console.log(`Applying fluid filter: ${filterType}`);

        document.querySelectorAll('.floating-action-item[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        let filteredTasks = [...this.tasks];
        if (filterType !== 'all') {
            filteredTasks = this.tasks.filter(task => {
                switch (filterType) {
                    case 'completed': return task.completed;
                    case 'in-progress': return !task.completed;
                    case 'high-priority': return task.priority === 'high';
                    default: return true;
                }
            });
        }

        const container = document.getElementById('tasksContainer');
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="welcome-message">
                    <h3>No tasks match the selected filters</h3>
                    <p>Try adjusting your filters or create a new task.</p>
                </div>
            `;
        } else {
            const tasksHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
            container.innerHTML = tasksHTML;
            this.setupTaskEventListeners();

            if (this.fluidModeEnabled) {
                setTimeout(() => {
                    this.makeTasksDraggable();
                    this.loadTaskPositions();
                }, 100);
            }
        }

        this.activeFilter = filterType;
        this.saveFluidSettings();
        this.updateFloatingFilterCounts();
    },

    updateFloatingFilterCounts() {
        if (!this.tasks) return;

        const counts = {
            all: this.tasks.length,
            completed: this.tasks.filter(task => task.completed).length,
            inProgress: this.tasks.filter(task => !task.completed).length,
            highPriority: this.tasks.filter(task => task.priority === 'high').length
        };

        const badges = [
            ['allCount', counts.all],
            ['completedCount', counts.completed],
            ['inProgressCount', counts.inProgress],
            ['highPriorityCount', counts.highPriority]
        ];

        badges.forEach(([id, count]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });
    },

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
        let lastValidPosition = { left: 0, top: 0 };

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

            const hasCollision = this.checkCollisions(taskElement);

            if (!hasCollision) {
                lastValidPosition = { left: newLeft, top: newTop };
            }
        };

        const onMouseUp = () => {
            if (!isDragging) return;

            const hasCollision = this.checkCollisions(taskElement);

            if (hasCollision) {
                taskElement.style.left = lastValidPosition.left + 'px';
                taskElement.style.top = lastValidPosition.top + 'px';

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
            this.savePosition(taskElement);

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

    checkCollisions(draggedTask) {
        const draggedRect = draggedTask.getBoundingClientRect();
        let hasCollision = false;

        document.querySelectorAll('.task-card').forEach(task => {
            if (task === draggedTask) return;
            const taskRect = task.getBoundingClientRect();
            const isColliding = !(draggedRect.right < taskRect.left ||
                draggedRect.left > taskRect.right ||
                draggedRect.bottom < taskRect.top ||
                draggedRect.top > taskRect.bottom);

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

        return hasCollision;
    },

    removeDraggable() {
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

    // ========== RESIZING (FLUID MODE) ==========
    addFluidResizeHandle(taskCard) {
        const oldElements = taskCard.querySelectorAll('.resize-handle, .resize-handle-fluid');
        oldElements.forEach(el => el.remove());

        const style = window.getComputedStyle(taskCard);
        const minHeight = parseInt(style.height) || 200;
        const minWidth = parseInt(style.width) || 300;

        const handle = document.createElement('div');
        handle.className = 'resize-handle-fluid';
        handle.innerHTML = '⋰';
        taskCard.appendChild(handle);

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

            const onMove = (e) => {
                if (!isResizing) return;

                let width = Math.max(minWidth, Math.min(800, startWidth + (e.clientX - startX)));
                let height = Math.max(minHeight, Math.min(800, startHeight + (e.clientY - startY)));

                taskCard.style.width = width + 'px';
                taskCard.style.height = height + 'px';
            };

            const onUp = () => {
                if (!isResizing) return;
                isResizing = false;
                handle.style.opacity = '0';
                document.body.style.cursor = '';
                this.saveFluidSize(taskCard, taskCard.offsetWidth, taskCard.offsetHeight);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    },

    // ========== POSITION & SIZE PERSISTENCE ==========
    savePosition(taskElement) {
        const taskId = taskElement.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        this.taskPositions.set(taskId, {
            x: parseInt(taskElement.style.left) || 0,
            y: parseInt(taskElement.style.top) || 0,
            timestamp: Date.now(),
            userId: this.currentUser.id
        });

        const key = `taskflow-task-positions-${this.currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(Object.fromEntries(this.taskPositions)));
    },

    loadTaskPositions() {
        const tasks = document.querySelectorAll('.task-card');
        if (!tasks.length) return;

        const key = `taskflow-task-positions-${this.currentUser?.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.taskPositions = new Map(Object.entries(data));
            } catch (e) {
                this.taskPositions = new Map();
            }
        }

        tasks.forEach((task, i) => {
            const pos = this.taskPositions.get(task.dataset.taskId);
            task.style.position = 'absolute';

            if (pos) {
                task.style.left = pos.x + 'px';
                task.style.top = pos.y + 'px';
            } else {
                task.style.left = (100 + i * 50) + 'px';
                task.style.top = (100 + i * 50) + 'px';
            }
        });

        setTimeout(() => {
            document.querySelectorAll('.task-card').forEach(card => {
                if (!card.querySelector('.resize-handle-fluid')) {
                    this.addFluidResizeHandle(card);
                    this.loadFluidSize(card);
                }
            });
        }, 100);
    },

    saveFluidSize(taskCard, width, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        if (!this.fluidTaskSizes) this.fluidTaskSizes = new Map();
        this.fluidTaskSizes.set(taskId, { width, height, timestamp: Date.now() });

        const key = `taskflow-fluid-sizes-${this.currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(Object.fromEntries(this.fluidTaskSizes)));
    },

    loadFluidSize(taskCard) {
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

    resetPositions() {
        if (!confirm('Reset all positions?')) return;

        this.taskPositions.clear();
        const key = `taskflow-task-positions-${this.currentUser?.id}`;
        localStorage.removeItem(key);

        if (this.fluidModeEnabled && this.applyFluidFilter) {
            this.applyFluidFilter(this.activeFilter);
        }

        this.showNotification('Positions reset', 'success');
    },

    // ========== PERSISTENCE ==========
    saveFluidSettings() {
        if (!this.currentUser) return;

        const settings = {
            fluidModeEnabled: this.fluidModeEnabled,
            isGridVisible: this.isGridVisible,
            activeFilter: this.activeFilter,
            userId: this.currentUser.id,
            timestamp: Date.now()
        };

        localStorage.setItem('taskflow-fluid-settings', JSON.stringify(settings));
    },

    loadFluidSettings() {
        if (!this.currentUser) return;

        const saved = localStorage.getItem('taskflow-fluid-settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            if (settings.userId === this.currentUser.id) {
                this.fluidModeEnabled = Boolean(settings.fluidModeEnabled);
                this.isGridVisible = Boolean(settings.isGridVisible);
                this.activeFilter = settings.activeFilter || 'all';

                if (this.fluidModeEnabled) {
                    setTimeout(() => this.enterFluidMode(), 500);
                }
            }
        } catch (error) {
            console.error('Error loading fluid settings:', error);
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const init = () => {
        if (window.dashboard && window.dashboard.initFluidMode) {
            window.dashboard.initFluidMode();

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

            const originalUpdateCounts = window.dashboard.updateFilterCounts;
            if (originalUpdateCounts) {
                window.dashboard.updateFilterCounts = function() {
                    const result = originalUpdateCounts.call(this);
                    if (this.updateFloatingFilterCounts) {
                        this.updateFloatingFilterCounts();
                    }
                    return result;
                };
            }

            console.log('Fluid mode initialized');
        } else {
            setTimeout(init, 1000);
        }
    };

    setTimeout(init, 1000);
});