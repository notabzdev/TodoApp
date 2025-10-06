// Fluid Mode Core Functionality

Object.assign(TaskFlowDashboard.prototype, {
    initFluidMode() {
        if (this.fluidModeInitialized) {
            return;
        }

        this.fluidModeEnabled = false;
        this.isGridVisible = false;
        this.draggedTask = null;
        this.taskPositions = new Map();
        this.gridSize = 5;
        this.collisionPadding = 15;
        this.lastValidPosition = null;
        this.isHoveringOverTask = false;
        this.activeFilter = 'all';
        this.fluidModeInitialized = true;

        this.createFluidModeElements();
        this.setupFluidModeEventListeners();
        this.loadFluidModeSettings();

        console.log('Fluid mode initialized');
    },

    createFluidModeElements() {
        if (document.getElementById('settingsModal')) {
            return;
        }

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
                                Enable dynamic workspace with ultra-smooth dragging
                            </div>
                        </div>
                        <button class="toggle-switch" id="fluidModeToggle"></button>
                    </div>
                    
                    <div class="settings-option">
                        <div class="settings-option-info">
                            <div class="settings-option-title">Show Micro Grid</div>
                            <div class="settings-option-description">
                                Display 5px precision grid for pixel-perfect positioning
                            </div>
                        </div>
                        <button class="toggle-switch" id="gridToggle"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        // FIXED: Create fluid controls with canvas reset button
        const fluidControls = document.createElement('div');
        fluidControls.className = 'fluid-controls';
        fluidControls.innerHTML = `
            <button class="fluid-control-btn" id="toggleGrid" title="Toggle Micro Grid">
                <span>📐</span>
            </button>
            <button class="fluid-control-btn" id="resetPositions" title="Reset Task Positions">
                <span>🔄</span>
            </button>
            <button class="fluid-control-btn" id="arrangeAuto" title="Auto Arrange">
                <span>✨</span>
            </button>
            <button class="fluid-control-btn reset-canvas" id="resetCanvas" title="Reset Canvas Position">
                <span>⌖</span>
            </button>
        `;
        document.body.appendChild(fluidControls);

        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'fluid-grid-overlay';
        gridOverlay.id = 'fluidGridOverlay';
        document.body.appendChild(gridOverlay);

        // Create canvas position indicator
        const canvasIndicator = document.createElement('div');
        canvasIndicator.className = 'canvas-position-indicator';
        canvasIndicator.id = 'canvasPositionIndicator';
        canvasIndicator.innerHTML = '<span id="canvasCoords">X: 0, Y: 0</span>';
        document.body.appendChild(canvasIndicator);
    },

    setupFluidModeEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn && !settingsBtn.dataset.fluidListener) {
            settingsBtn.addEventListener('click', () => this.showSettings());
            settingsBtn.dataset.fluidListener = 'true';
        }

        // Settings modal close
        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings && !closeSettings.dataset.fluidListener) {
            closeSettings.addEventListener('click', () => this.hideSettings());
            closeSettings.dataset.fluidListener = 'true';
        }

        // Fluid mode toggle
        const fluidModeToggle = document.getElementById('fluidModeToggle');
        if (fluidModeToggle && !fluidModeToggle.dataset.fluidListener) {
            fluidModeToggle.addEventListener('click', () => this.toggleFluidMode());
            fluidModeToggle.dataset.fluidListener = 'true';
        }

        // Grid toggle
        const gridToggle = document.getElementById('gridToggle');
        if (gridToggle && !gridToggle.dataset.fluidListener) {
            gridToggle.addEventListener('click', () => this.toggleGrid());
            gridToggle.dataset.fluidListener = 'true';
        }

        // Control buttons
        const toggleGridBtn = document.getElementById('toggleGrid');
        if (toggleGridBtn && !toggleGridBtn.dataset.fluidListener) {
            toggleGridBtn.addEventListener('click', () => this.toggleGrid());
            toggleGridBtn.dataset.fluidListener = 'true';
        }

        const resetBtn = document.getElementById('resetPositions');
        if (resetBtn && !resetBtn.dataset.fluidListener) {
            resetBtn.addEventListener('click', () => this.resetTaskPositions());
            resetBtn.dataset.fluidListener = 'true';
        }

        const autoBtn = document.getElementById('arrangeAuto');
        if (autoBtn && !autoBtn.dataset.fluidListener) {
            autoBtn.addEventListener('click', () => this.autoArrangeTasks());
            autoBtn.dataset.fluidListener = 'true';
        }

        // Modal click to close
        const modal = document.getElementById('settingsModal');
        if (modal && !modal.dataset.fluidListener) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideSettings();
            });
            modal.dataset.fluidListener = 'true';
        }

        // Setup floating action bar
        this.setupWorkingFloatingActionBar();
    },

    setupWorkingFloatingActionBar() {
        console.log('Setting up WORKING floating action bar...');

        const setupButtons = () => {
            const createBtn = document.getElementById('createTaskBtn');
            if (createBtn) {
                createBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('CREATE TASK CLICKED');
                    this.showTaskModal(false);
                };
                console.log('Create button connected');
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
                        e.stopPropagation();
                        console.log(`FILTER ${filter.toUpperCase()} CLICKED`);
                        this.applyFluidFilter(filter);
                    };
                    console.log(`Filter ${filter} button connected`);
                }
            });
        };

        setupButtons();
        setTimeout(setupButtons, 500);
        setTimeout(setupButtons, 1000);
    },

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
                    if (this.makeTasksDraggable) this.makeTasksDraggable();
                    if (this.loadTaskPositions) this.loadTaskPositions();
                }, 100);
            }
        }

        this.activeFilter = filterType;
        this.saveFluidModeSettings();
        this.updateFloatingFilterCounts();

        console.log(`Filtered to ${filteredTasks.length} tasks`);
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

        const sidebarBadges = [
            ['allCountSidebar', counts.all],
            ['completedCountSidebar', counts.completed],
            ['inProgressCountSidebar', counts.inProgress],
            ['highPriorityCountSidebar', counts.highPriority]
        ];

        sidebarBadges.forEach(([id, count]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });
    },

    showSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('show');
            this.updateToggleStates();
        }
    },

    hideSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('show');
        }
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

    toggleFluidMode() {
        this.fluidModeEnabled = !this.fluidModeEnabled;
        console.log(`Fluid mode: ${this.fluidModeEnabled ? 'ENABLED' : 'DISABLED'}`);

        if (this.fluidModeEnabled) {
            this.enterFluidMode();
        } else {
            this.exitFluidMode();
        }

        this.updateToggleStates();
        this.saveFluidModeSettings();
    },

    enterFluidMode() {
        document.body.classList.add('fluid-mode-transitioning');

        setTimeout(() => {
            document.body.classList.add('fluid-mode');
            document.body.classList.remove('fluid-mode-transitioning');
        }, 50);

        setTimeout(() => {
            this.applyFluidFilter(this.activeFilter);
            this.setupWorkingFloatingActionBar();
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

        this.removeTaskDraggable();

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
        this.saveFluidModeSettings();

        this.showNotification(
            this.isGridVisible ? 'Grid enabled' : 'Grid disabled',
            'info'
        );
    },

    saveFluidModeSettings() {
        if (!this.currentUser) return;

        const settings = {
            fluidModeEnabled: this.fluidModeEnabled,
            isGridVisible: this.isGridVisible,
            activeFilter: this.activeFilter,
            userId: this.currentUser.id,
            timestamp: Date.now()
        };

        localStorage.setItem('taskflow-fluid-settings', JSON.stringify(settings));
        console.log('SAVED fluid settings:', settings);
    },

    loadFluidModeSettings() {
        if (!this.currentUser) return;

        const saved = localStorage.getItem('taskflow-fluid-settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            if (settings.userId === this.currentUser.id) {
                this.fluidModeEnabled = Boolean(settings.fluidModeEnabled);
                this.isGridVisible = Boolean(settings.isGridVisible);
                this.activeFilter = settings.activeFilter || 'all';

                console.log('LOADED fluid settings:', settings);

                if (this.fluidModeEnabled) {
                    setTimeout(() => {
                        this.enterFluidMode();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error loading fluid settings:', error);
        }

        this.loadTaskPositionsFromStorage();
    },

    saveTaskPosition(taskId, x, y) {
        if (!this.currentUser) return;

        const position = {
            x: Number(x),
            y: Number(y),
            timestamp: Date.now(),
            userId: this.currentUser.id
        };

        this.taskPositions.set(String(taskId), position);
        this.saveTaskPositionsToStorage();
        console.log(`SAVED position for task ${taskId}:`, position);
    },

    saveTaskPositionsToStorage() {
        if (!this.currentUser || !this.taskPositions) return;

        const positions = Object.fromEntries(this.taskPositions);
        const key = `taskflow-task-positions-${this.currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(positions));
        console.log(`SAVED ${this.taskPositions.size} positions to storage`);
    },

    loadTaskPositionsFromStorage() {
        if (!this.currentUser) return;

        const key = `taskflow-task-positions-${this.currentUser.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const positions = JSON.parse(saved);
                this.taskPositions = new Map(Object.entries(positions));
                console.log(`LOADED ${this.taskPositions.size} positions from storage`);
            } catch (error) {
                console.error('Error loading positions:', error);
                this.taskPositions = new Map();
            }
        } else {
            this.taskPositions = new Map();
        }
    },

    makeTasksDraggable() {
        console.log('makeTasksDraggable - implemented in dashboardfive.js');
    },

    removeTaskDraggable() {
        document.querySelectorAll('.task-card').forEach(task => {
            task.style.position = '';
            task.style.left = '';
            task.style.top = '';
            task.classList.remove('dragging', 'collision-warning');
        });
    },

    loadTaskPositions() {
        console.log('loadTaskPositions - implemented in dashboardfive.js');
    },

    resetTaskPositions() {
        if (confirm('Reset all task positions?')) {
            this.taskPositions.clear();
            this.saveTaskPositionsToStorage();
            if (this.fluidModeEnabled) {
                this.applyFluidFilter(this.activeFilter);
            }
            this.showNotification('Positions reset!', 'success');
        }
    },

    autoArrangeTasks() {
        this.showNotification('Auto-arrange coming soon', 'info');
    }
});

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    const initFluidMode = () => {
        if (window.dashboard && window.dashboard.initFluidMode) {
            window.dashboard.initFluidMode();

            // Override updateFilterCounts
            const original = window.dashboard.updateFilterCounts;
            window.dashboard.updateFilterCounts = function() {
                const result = original.call(this);
                if (this.updateFloatingFilterCounts) {
                    this.updateFloatingFilterCounts();
                }
                return result;
            };

            console.log('Fluid mode setup complete');
        } else {
            setTimeout(initFluidMode, 1000);
        }
    };

    setTimeout(initFluidMode, 1000);
});