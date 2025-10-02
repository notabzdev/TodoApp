// ===== TASKBOX.JS - COMPLETE FILE WITH ALL FIXES =====
// Enhanced Task Box Interactions with Context Menu and Pin Feature
// Replace your ENTIRE taskbox.js file with this

Object.assign(TaskFlowDashboard.prototype, {
    initTaskBoxEnhancements() {
        console.log('✅ Initializing task box enhancements (context menu)');
        this.expandedGroups = new Set();
        this.contextMenuOpen = false;
    },

    enhanceTaskCard(taskCard) {
        if (!taskCard || taskCard.dataset.enhanced) return;

        const taskId = taskCard.dataset.taskId;
        const isGroup = taskCard.classList.contains('task-group');

        // Add context menu
        this.addContextMenuToTask(taskCard);

        // Add visual enhancements
        this.addTaskBoxEffects(taskCard, isGroup);

        taskCard.dataset.enhanced = 'true';
    },

    addContextMenuToTask(taskCard) {
        // Remove any existing listener
        if (taskCard._contextMenuHandler) {
            taskCard.removeEventListener('contextmenu', taskCard._contextMenuHandler);
        }

        // Create new handler
        const handler = (e) => {
            // Don't interfere with resize handle
            if (e.target.closest('.resize-handle') ||
                e.target.closest('.resize-handle-bidirectional')) {
                return;
            }

            // Don't show if clicking buttons or inputs
            if (e.target.closest('button') ||
                e.target.closest('input') ||
                e.target.closest('[contenteditable="true"]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.showTaskContextMenu(taskCard, e.clientX, e.clientY);
        };

        // Store reference and add listener
        taskCard._contextMenuHandler = handler;
        taskCard.addEventListener('contextmenu', handler);
    },

    showTaskContextMenu(taskCard, x, y) {
        const taskId = taskCard.dataset.taskId;
        const isGroup = taskCard.classList.contains('task-group');
        const isPinned = taskCard.classList.contains('pinned');

        console.log('📋 Showing context menu for task:', taskId, 'Pinned:', isPinned);

        // Mark menu as open
        this.contextMenuOpen = true;

        // Remove any existing menu
        const existing = document.getElementById('task-context-menu');
        if (existing) existing.remove();

        // Create menu container
        const menu = document.createElement('div');
        menu.id = 'task-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 8px;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            min-width: 200px;
            color: var(--text-primary);
            font-family: inherit;
            opacity: 0;
            transform: scale(0.95);
            transition: all 0.2s ease;
        `;

        // Define menu items with dynamic pin text
        const menuItems = [
            {
                icon: '✏️',
                text: 'Edit Task',
                action: () => {
                    const task = this.tasks.find(t => t.id == taskId);
                    if (task && this.showTaskModal) {
                        this.showTaskModal(false, task);
                    }
                }
            },
            {
                icon: '📋',
                text: 'Duplicate Task',
                action: () => {
                    this.duplicateTask(taskId);
                }
            },
            {
                icon: isPinned ? '📍' : '📌',
                text: isPinned ? 'Unpin Task' : 'Pin Task',
                action: () => {
                    this.pinTask(taskId, taskCard);
                }
            },
            {
                icon: '🎨',
                text: 'Change Color',
                action: () => {
                    this.showColorPicker(taskCard);
                }
            },
            {
                icon: '📏',
                text: 'Reset Size',
                action: () => {
                    if (this.resetTaskSize) {
                        this.resetTaskSize(taskId);
                        this.showNotification('Task size reset!', 'success');
                    }
                }
            },
            {
                icon: '🗑️',
                text: 'Delete Task',
                action: () => {
                    if (confirm('Are you sure you want to delete this task?')) {
                        this.deleteTask(taskId);
                    }
                },
                danger: true
            }
        ];

        // Add group-specific option
        if (isGroup) {
            menuItems.splice(3, 0, {
                icon: '📂',
                text: this.expandedGroups.has(taskId) ? 'Collapse' : 'Expand',
                action: () => this.toggleGroupExpansion(taskCard)
            });
        }

        // Create menu items
        menuItems.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                ${item.danger ? 'color: #ef4444;' : ''}
            `;

            menuItem.innerHTML = `
                <span style="font-size: 16px;">${item.icon}</span>
                <span style="font-size: 14px;">${item.text}</span>
            `;

            // Hover effect
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = item.danger ?
                    'rgba(239, 68, 68, 0.1)' :
                    'rgba(255, 255, 255, 0.1)';
                menuItem.style.transform = 'translateX(3px)';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = '';
                menuItem.style.transform = '';
            });

            // Click handler
            menuItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (item.action) {
                    item.action();
                }

                this.hideContextMenu();
            });

            menu.appendChild(menuItem);

            // Add separator after certain items
            if (index === 2 || index === menuItems.length - 2) {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    height: 1px;
                    background: var(--border-color);
                    margin: 4px 0;
                `;
                menu.appendChild(separator);
            }
        });

        // Add to page
        document.body.appendChild(menu);

        // Animate in
        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
        });

        // Adjust if off-screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (y - rect.height) + 'px';
        }

        // Close when clicking outside
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                this.hideContextMenu();
                document.removeEventListener('click', closeHandler);
                document.removeEventListener('contextmenu', closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeHandler);
            document.addEventListener('contextmenu', closeHandler);
        }, 100);
    },

    hideContextMenu() {
        const menu = document.getElementById('task-context-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (menu.parentNode) {
                    menu.remove();
                }
            }, 200);
        }
        this.contextMenuOpen = false;
    },

    // ===== PIN FEATURE - COMPLETE IMPLEMENTATION =====
    pinTask(taskId, taskCard) {
        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');
        const index = pinned.indexOf(taskId);
        const isPinned = index > -1;

        if (isPinned) {
            // Unpin
            pinned.splice(index, 1);
            taskCard.classList.remove('pinned');

            // Re-enable dragging in fluid mode
            if (document.body.classList.contains('fluid-mode')) {
                taskCard.style.cursor = 'grab';
                taskCard.title = '';

                // Re-apply draggable
                if (window.dashboard.makeSingleTaskDraggable) {
                    // Clean up old draggable first
                    if (taskCard._cleanupDraggable) {
                        taskCard._cleanupDraggable();
                        delete taskCard._cleanupDraggable;
                        delete taskCard._isDraggable;
                    }
                    window.dashboard.makeSingleTaskDraggable(taskCard);
                }
            }

            if (this.showNotification) {
                this.showNotification('Task unpinned - you can now move it', 'info');
            }
            console.log('📍 Task unpinned:', taskId);
        } else {
            // Pin
            pinned.push(taskId);
            taskCard.classList.add('pinned');

            // Disable dragging in fluid mode
            if (document.body.classList.contains('fluid-mode')) {
                taskCard.style.cursor = 'not-allowed';
                taskCard.title = 'Task is pinned - right-click to unpin';

                // Remove draggable
                if (taskCard._cleanupDraggable) {
                    taskCard._cleanupDraggable();
                    delete taskCard._cleanupDraggable;
                    delete taskCard._isDraggable;
                }
            }

            if (this.showNotification) {
                this.showNotification('Task pinned! 📌 Position locked', 'success');
            }
            console.log('📌 Task pinned:', taskId);
        }

        localStorage.setItem('taskflow-pinned-tasks', JSON.stringify(pinned));

        // Sort tasks
        if (!document.body.classList.contains('fluid-mode')) {
            this.sortTasksByPinned();
        }
    },

    sortTasksByPinned() {
        if (!this.tasks) return;

        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');

        this.tasks.sort((a, b) => {
            const aIsPinned = pinned.includes(a.id);
            const bIsPinned = pinned.includes(b.id);

            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;
            return 0;
        });

        // Re-render to show new order
        if (this.renderTasks) {
            this.renderTasks();
        }
    },

    // Load pinned state for all tasks (call this after rendering)
    loadPinnedStates() {
        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');

        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;
            if (pinned.includes(taskId)) {
                card.classList.add('pinned');
            }
        });

        console.log(`📌 Loaded ${pinned.length} pinned tasks`);
    },

    // ===== PLACEHOLDER FUNCTIONS FOR CONTEXT MENU ITEMS =====
    duplicateTask(taskId) {
        const task = this.tasks ? this.tasks.find(t => t.id == taskId) : null;

        if (task) {
            if (this.showNotification) {
                this.showNotification('Duplicate feature coming soon!', 'info');
            }
            console.log('Duplicate task:', taskId);
            // TODO: Implement actual duplication
            // const newTask = { ...task, title: task.title + ' (Copy)' };
            // this.createTask(newTask);
        }
    },

    showColorPicker(taskCard) {
        if (this.showNotification) {
            this.showNotification('Color picker coming soon!', 'info');
        }
        console.log('Show color picker for:', taskCard.dataset.taskId);
        // TODO: Implement color picker modal
    },

    toggleGroupExpansion(taskCard) {
        const taskId = taskCard.dataset.taskId;

        if (this.expandedGroups.has(taskId)) {
            this.expandedGroups.delete(taskId);
            console.log('Collapsed group:', taskId);
        } else {
            this.expandedGroups.add(taskId);
            console.log('Expanded group:', taskId);
        }

        // Trigger visual update if you have group expand/collapse UI
        // You might need to re-render or toggle a class
    },

    // ===== VISUAL EFFECTS =====
    addTaskBoxEffects(taskCard, isGroup) {
        // Add ripple effect container
        if (!taskCard.querySelector('.ripple-container')) {
            const rippleContainer = document.createElement('div');
            rippleContainer.className = 'ripple-container';
            rippleContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
                border-radius: inherit;
            `;
            taskCard.appendChild(rippleContainer);
        }
    },

    addClickEffect(taskCard, e) {
        const rippleContainer = taskCard.querySelector('.ripple-container');
        if (!rippleContainer) return;

        const ripple = document.createElement('div');
        const rect = taskCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        `;

        rippleContainer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    addHoverEffect(taskCard) {
        // Subtle hover effects handled by CSS
        // This can be used for additional JS-based effects if needed
    },

    removeHoverEffect(taskCard) {
        // Remove any temporary hover states
    },

    animateNewTask(taskCard) {
        taskCard.classList.add('new-task');
        setTimeout(() => {
            taskCard.classList.remove('new-task');
        }, 2000);
    },

    quickEditTask(taskCard) {
        const task = this.tasks.find(t => t.id == taskCard.dataset.taskId);
        if (task && this.showTaskModal) {
            this.showTaskModal(false, task);
        }
    },

    setupTaskBoxInteractions() {
        // This method can be used to hook into other task interactions if needed
        console.log('✅ Task box interactions ready');
    }
});

// Auto-initialize task box enhancements
document.addEventListener('DOMContentLoaded', () => {
    const initTaskBox = () => {
        if (window.dashboard && window.dashboard.initTaskBoxEnhancements) {
            window.dashboard.initTaskBoxEnhancements();
            console.log('✅ Task box enhancements active');
        } else {
            setTimeout(initTaskBox, 500);
        }
    };

    setTimeout(initTaskBox, 1000);
});