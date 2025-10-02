// ===== INTEGRATION.JS - COMPLETE FIXED VERSION =====
// Simplified integration script that hooks everything together
// Replace your entire integration.js file with this

(function() {
    'use strict';

    console.log('🚀 TaskFlow Integration: Starting...');

    let initialized = false;

    const initializeEnhancements = () => {
        // Wait for dashboard and user
        if (!window.dashboard || !window.dashboard.currentUser) {
            setTimeout(initializeEnhancements, 500);
            return;
        }

        // Prevent multiple initializations
        if (initialized) {
            console.log('⚠️ Already initialized, skipping');
            return;
        }

        console.log('✅ Dashboard ready, initializing enhancements...');

        try {
            // 1. Initialize resize functionality
            if (typeof window.dashboard.initTaskResize === 'function') {
                window.dashboard.initTaskResize();
                console.log('✅ Resize initialized');
            } else {
                console.warn('⚠️ Resize function not found');
            }

            // 2. Initialize task box enhancements (context menu)
            if (typeof window.dashboard.initTaskBoxEnhancements === 'function') {
                window.dashboard.initTaskBoxEnhancements();
                console.log('✅ Context menu initialized');
            } else {
                console.warn('⚠️ Task box enhancements not found');
            }

            // 3. Initialize fluid mode (if available)
            if (typeof window.dashboard.initFluidMode === 'function') {
                window.dashboard.initFluidMode();
                console.log('✅ Fluid mode initialized');
            }

            // 4. Hook into task rendering
            const originalRenderFilteredTasks = window.dashboard.renderFilteredTasks;

            if (originalRenderFilteredTasks && !window.dashboard._enhancementsHooked) {
                window.dashboard._enhancementsHooked = true;

                window.dashboard.renderFilteredTasks = function(filteredTasks) {
                    // Call original render
                    originalRenderFilteredTasks.call(this, filteredTasks);

                    // Add enhancements after a short delay
                    setTimeout(() => {
                        const taskCards = document.querySelectorAll('.task-card');

                        taskCards.forEach(card => {
                            // Add resize handle
                            if (this.addResizeHandle) {
                                this.addResizeHandle(card);
                                this.loadTaskSize(card);
                            }

                            // Add context menu
                            if (this.addContextMenuToTask) {
                                this.addContextMenuToTask(card);
                            }

                            // Enhance task card visuals
                            if (this.enhanceTaskCard) {
                                this.enhanceTaskCard(card);
                            }
                        });

                        console.log(`✨ Enhanced ${taskCards.length} tasks`);
                    }, 100);
                };

                console.log('✅ Rendering hook installed');
            }

            // 5. Mark as initialized
            initialized = true;
            console.log('🎉 All enhancements initialized successfully!');

            // Show success notification
            if (window.dashboard.showNotification) {
                setTimeout(() => {
                    window.dashboard.showNotification(
                        'Enhanced features loaded! Right-click tasks for menu, drag corner to resize.',
                        'success'
                    );
                }, 2000);
            }

        } catch (error) {
            console.error('❌ Integration error:', error);
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification(
                    'Some features may not be available.',
                    'error'
                );
            }
        }
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancements);
    } else {
        initializeEnhancements();
    }

    // Backup attempts (in case of timing issues)
    setTimeout(initializeEnhancements, 1000);
    setTimeout(initializeEnhancements, 2000);

})();