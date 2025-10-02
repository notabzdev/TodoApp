// Complete Integration Script - FIXED VERSION
// Add to dashboard.html before closing </body> tag

(function() {
    'use strict';

    console.log('TaskFlow Integration: Initializing all enhancements...');

    let integrationComplete = false;
    let dashboardReady = false;

    // Wait for dashboard to be ready
    const initializeEnhancements = () => {
        if (!window.dashboard || !window.dashboard.currentUser || integrationComplete) {
            if (!dashboardReady) {
                setTimeout(initializeEnhancements, 500);
            }
            return;
        }

        dashboardReady = true;
        console.log('Dashboard ready, initializing enhancements...');

        try {
            // 1. Initialize resize functionality
            if (typeof window.dashboard.initTaskResize === 'function') {
                window.dashboard.initTaskResize();
                console.log('✅ Resize functionality initialized');
            }

            // 2. Initialize task box enhancements
            if (typeof window.dashboard.initTaskBoxEnhancements === 'function') {
                window.dashboard.initTaskBoxEnhancements();
                window.dashboard.setupTaskBoxInteractions();
                console.log('✅ Task box enhancements initialized');
            }

            // 3. Initialize fluid mode
            if (typeof window.dashboard.initFluidMode === 'function') {
                window.dashboard.initFluidMode();
                console.log('✅ Fluid mode initialized');
            }

            // 4. Override task rendering to include all enhancements
            const originalRenderFilteredTasks = window.dashboard.renderFilteredTasks;
            if (originalRenderFilteredTasks && !window.dashboard._enhancedRenderingActive) {
                window.dashboard._enhancedRenderingActive = true;

                window.dashboard.renderFilteredTasks = function(filteredTasks) {
                    // Call original render
                    originalRenderFilteredTasks.call(this, filteredTasks);

                    // Add all enhancements after rendering
                    setTimeout(() => {
                        document.querySelectorAll('.task-card').forEach(card => {
                            // Add resize handles
                            if (this.addResizeHandle) {
                                this.addResizeHandle(card);
                                this.loadTaskSize(card);
                            }

                            // Add task box enhancements
                            if (this.enhanceTaskCard) {
                                this.enhanceTaskCard(card);
                            }

                            // Add new task animation if it's actually new
                            if (card.dataset.isNew) {
                                if (this.animateNewTask) {
                                    this.animateNewTask(card);
                                }
                                delete card.dataset.isNew;
                            }
                        });
                    }, 100);
                };

                console.log('✅ Enhanced rendering active');
            }

            // 5. Override createTask to mark new tasks
            const originalCreateTask = window.dashboard.createTask;
            if (originalCreateTask && !window.dashboard._enhancedCreateTask) {
                window.dashboard._enhancedCreateTask = true;

                window.dashboard.createTask = async function() {
                    const result = await originalCreateTask.call(this);

                    // Mark the newest task as new for animation
                    setTimeout(() => {
                        const cards = document.querySelectorAll('.task-card');
                        if (cards.length > 0) {
                            const newestCard = cards[cards.length - 1];
                            newestCard.dataset.isNew = 'true';
                        }
                    }, 500);

                    return result;
                };

                console.log('✅ Enhanced task creation active');
            }

            // 6. Enhanced keyboard shortcuts
            if (!document._keyboardShortcutsActive) {
                document._keyboardShortcutsActive = true;

                document.addEventListener('keydown', (e) => {
                    // Only in fluid mode for fluid shortcuts
                    if (window.dashboard.fluidModeEnabled) {
                        switch(e.key) {
                            case 'n':
                                if (e.ctrlKey || e.metaKey) {
                                    e.preventDefault();
                                    window.dashboard.showTaskModal(false);
                                }
                                break;
                            case 'g':
                                if (e.ctrlKey || e.metaKey) {
                                    e.preventDefault();
                                    window.dashboard.showTaskModal(true);
                                }
                                break;
                            case 'Escape':
                                // Collapse all expanded groups
                                document.querySelectorAll('.task-card.expanded').forEach(card => {
                                    if (window.dashboard.collapseGroup) {
                                        window.dashboard.collapseGroup(card, card.dataset.taskId);
                                    }
                                });
                                // Hide context menus
                                if (window.dashboard.hideContextMenu) {
                                    window.dashboard.hideContextMenu();
                                }
                                break;
                        }
                    }

                    // Global shortcuts
                    switch(e.key) {
                        case 's':
                            if (e.ctrlKey || e.metaKey) {
                                e.preventDefault();
                                // Auto-save all settings
                                if (window.dashboard.saveFluidModeSettings) {
                                    window.dashboard.saveFluidModeSettings();
                                }
                                if (window.dashboard.saveTaskSizesToStorage) {
                                    window.dashboard.saveTaskSizesToStorage();
                                }
                                console.log('⚡ Settings saved via keyboard shortcut');
                            }
                            break;
                    }
                });

                console.log('✅ Enhanced keyboard shortcuts active');
            }

            // 7. Auto-save improvements
            if (!window._autoSaveActive) {
                window._autoSaveActive = true;

                const autoSave = () => {
                    if (window.dashboard.saveFluidModeSettings) {
                        window.dashboard.saveFluidModeSettings();
                    }
                    if (window.dashboard.saveTaskSizesToStorage) {
                        window.dashboard.saveTaskSizesToStorage();
                    }
                };

                // Auto-save every 30 seconds
                setInterval(autoSave, 30000);

                // Auto-save on visibility change (tab switch, etc.)
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        autoSave();
                    }
                });

                // Auto-save on page unload
                window.addEventListener('beforeunload', autoSave);

                console.log('✅ Auto-save system active');
            }

            // 8. Performance monitoring
            if (!window._performanceMonitorActive) {
                window._performanceMonitorActive = true;

                let performanceWarnings = 0;
                const monitorPerformance = () => {
                    const taskCount = document.querySelectorAll('.task-card').length;
                    if (taskCount > 50 && performanceWarnings < 1) {
                        if (window.dashboard.showNotification) {
                            window.dashboard.showNotification(
                                `Performance tip: ${taskCount} tasks loaded. Consider using filters for better performance.`,
                                'info'
                            );
                        }
                        performanceWarnings++;
                    }
                };

                setInterval(monitorPerformance, 10000);
                console.log('✅ Performance monitoring active');
            }

            // 9. Enhanced error handling
            if (!window._errorHandlerActive) {
                window._errorHandlerActive = true;

                window.addEventListener('error', (e) => {
                    console.error('TaskFlow Error:', e.error);
                    if (window.dashboard && window.dashboard.showNotification) {
                        window.dashboard.showNotification(
                            'An error occurred. Features may not work properly.',
                            'error'
                        );
                    }
                });

                window.addEventListener('unhandledrejection', (e) => {
                    console.error('TaskFlow Promise Rejection:', e.reason);
                    if (window.dashboard && window.dashboard.showNotification) {
                        window.dashboard.showNotification(
                            'A background error occurred.',
                            'error'
                        );
                    }
                });

                console.log('✅ Error handling active');
            }

            // 10. Load saved task customizations
            setTimeout(() => {
                document.querySelectorAll('.task-card').forEach(card => {
                    // Load saved colors, pins, etc.
                    const taskId = card.dataset.taskId;
                    if (taskId) {
                        // Load pinned state
                        const pinnedTasks = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');
                        if (pinnedTasks.includes(taskId)) {
                            card.classList.add('pinned');
                        }

                        // Load custom colors
                        const customColors = JSON.parse(localStorage.getItem('taskflow-custom-colors') || '{}');
                        if (customColors[taskId]) {
                            card.dataset.customColor = customColors[taskId];
                            // Apply the color
                            if (window.dashboard.applyTaskColor) {
                                window.dashboard.applyTaskColor(card, customColors[taskId]);
                            }
                        }
                    }
                });
            }, 1000);

            integrationComplete = true;
            console.log('✅ All TaskFlow enhancements initialized successfully!');

            // Show welcome message for enhanced features
            setTimeout(() => {
                if (window.dashboard.fluidModeEnabled && window.dashboard.showNotification) {
                    window.dashboard.showNotification(
                        'Enhanced features active! Right-click tasks for options, hover for resize.',
                        'success'
                    );
                } else if (window.dashboard.showNotification) {
                    window.dashboard.showNotification(
                        'TaskFlow enhanced features loaded successfully!',
                        'success'
                    );
                }
            }, 2000);

        } catch (error) {
            console.error('TaskFlow Integration Error:', error);
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification(
                    'Some enhanced features may not be available.',
                    'error'
                );
            }
        }
    };

    // Enhanced feature status check
    const checkFeatureStatus = () => {
        const features = {
            'Dashboard': !!window.dashboard,
            'Resize': !!(window.dashboard && window.dashboard.initTaskResize),
            'TaskBox': !!(window.dashboard && window.dashboard.initTaskBoxEnhancements),
            'FluidMode': !!(window.dashboard && window.dashboard.initFluidMode),
            'Integration': integrationComplete
        };

        console.log('🔧 TaskFlow Feature Status:', features);

        const missingFeatures = Object.entries(features)
            .filter(([name, status]) => !status)
            .map(([name]) => name);

        if (missingFeatures.length > 0) {
            console.warn('⚠️ Missing features:', missingFeatures.join(', '));
        }

        return features;
    };

    // Make feature check available globally
    window.taskFlowStatus = checkFeatureStatus;

    // Emergency reset function
    window.resetTaskFlowEnhancements = () => {
        console.log('🔄 Resetting TaskFlow enhancements...');

        // Clear all localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('taskflow-'));
        keys.forEach(key => localStorage.removeItem(key));

        // Reset all tasks to default state
        document.querySelectorAll('.task-card').forEach(card => {
            card.style.cssText = '';
            card.className = card.className.replace(/\b(pinned|expanded|resizing|new-task|clicked|focus-ring)\b/g, '');
            card.removeAttribute('data-custom-color');
            card.removeAttribute('data-enhanced');

            // Remove enhancement elements
            const enhancements = card.querySelectorAll('.resize-handle, .resize-dimensions, .ripple-container, .task-type-indicator');
            enhancements.forEach(el => el.remove());
        });

        // Reload page to clean state
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    // Debug helper
    window.debugTaskFlow = () => {
        console.log('🐛 TaskFlow Debug Info:');
        console.log('Dashboard:', window.dashboard);
        console.log('Features:', checkFeatureStatus());
        console.log('Tasks:', document.querySelectorAll('.task-card').length);
        console.log('Enhanced Tasks:', document.querySelectorAll('.task-card[data-enhanced]').length);
        console.log('Local Storage:', Object.keys(localStorage).filter(k => k.startsWith('taskflow-')));
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancements);
    } else {
        initializeEnhancements();
    }

    // Backup initialization attempts
    setTimeout(initializeEnhancements, 1000);
    setTimeout(initializeEnhancements, 3000);
    setTimeout(initializeEnhancements, 5000);

})();