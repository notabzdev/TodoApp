
// Works with both normal mode AND fluid mode

(function() {
    'use strict';

    console.log('🚀 TaskFlow Integration: Starting...');

    let initialized = false;

    const initializeEnhancements = () => {
        if (!window.dashboard || !window.dashboard.currentUser) {
            setTimeout(initializeEnhancements, 500);
            return;
        }

        if (initialized) {
            console.log('⚠️ Already initialized, skipping');
            return;
        }

        console.log('✅ Dashboard ready, initializing enhancements...');

        try {
            // 1. Initialize resize
            if (typeof window.dashboard.initTaskResize === 'function') {
                window.dashboard.initTaskResize();
                console.log('✅ Resize initialized');
            }

            // 2. Initialize context menu
            if (typeof window.dashboard.initTaskBoxEnhancements === 'function') {
                window.dashboard.initTaskBoxEnhancements();
                console.log('✅ Context menu initialized');
            }

            // 3. Initialize fluid mode
            if (typeof window.dashboard.initFluidMode === 'function') {
                window.dashboard.initFluidMode();
                console.log('✅ Fluid mode initialized');
            }

            // 4. Function to enhance tasks
            const enhanceAllTasks = function() {
                const taskCards = document.querySelectorAll('.task-card');

                if (taskCards.length === 0) {
                    console.warn('⚠️ No tasks found to enhance');
                    return;
                }

                console.log(`🔍 Found ${taskCards.length} tasks to enhance`);

                taskCards.forEach(card => {
                    // Add resize (check if not already added)
                    if (!card.querySelector('.resize-handle') && this.addResizeHandle) {
                        this.addResizeHandle(card);
                        this.loadTaskSize(card);
                    }

                    // Add context menu (check if not already added)
                    if (!card._contextMenuHandler && this.addContextMenuToTask) {
                        this.addContextMenuToTask(card);
                    }

                    // Enhance visuals
                    if (!card.dataset.enhanced && this.enhanceTaskCard) {
                        this.enhanceTaskCard(card);
                    }
                });

                // Load pinned states
                if (this.loadPinnedStates) {
                    this.loadPinnedStates();
                }

                console.log(`✨ Enhanced ${taskCards.length} tasks`);
            };

            // 5. Hook renderTasks (for normal grid/list mode)
            const originalRenderTasks = window.dashboard.renderTasks;
            if (originalRenderTasks && !window.dashboard._renderTasksHooked) {
                window.dashboard._renderTasksHooked = true;

                window.dashboard.renderTasks = function() {
                    originalRenderTasks.call(this);

                    // Only enhance here if NOT in fluid mode
                    // Fluid mode will enhance in loadTaskPositions
                    if (!this.fluidModeEnabled) {
                        setTimeout(() => enhanceAllTasks.call(this), 150);
                    }
                };

                console.log('✅ renderTasks hook installed');
            }

            // 6. Hook renderFilteredTasks
            const originalRenderFilteredTasks = window.dashboard.renderFilteredTasks;
            if (originalRenderFilteredTasks && !window.dashboard._renderFilteredTasksHooked) {
                window.dashboard._renderFilteredTasksHooked = true;

                window.dashboard.renderFilteredTasks = function(filteredTasks) {
                    originalRenderFilteredTasks.call(this, filteredTasks);

                    // Only enhance here if NOT in fluid mode
                    if (!this.fluidModeEnabled) {
                        setTimeout(() => enhanceAllTasks.call(this), 150);
                    }
                };

                console.log('✅ renderFilteredTasks hook installed');
            }

            // 7. Enhance any existing tasks (initial load)
            setTimeout(() => {
                if (window.dashboard && !window.dashboard.fluidModeEnabled) {
                    enhanceAllTasks.call(window.dashboard);
                }
            }, 500);

            // 8. Mark as initialized
            initialized = true;
            console.log('🎉 All enhancements initialized successfully!');

            // Show notification
            if (window.dashboard.showNotification) {
                setTimeout(() => {
                    window.dashboard.showNotification(
                        'Enhanced features loaded! Right-click tasks for menu, hover corner to resize.',
                        'success'
                    );
                }, 2000);
            }

        } catch (error) {
            console.error('❌ Integration error:', error);
        }
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancements);
    } else {
        initializeEnhancements();
    }

    // Backup attempts
    setTimeout(initializeEnhancements, 1000);
    setTimeout(initializeEnhancements, 2000);

})();
