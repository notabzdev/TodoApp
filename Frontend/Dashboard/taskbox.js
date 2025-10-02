// ===== TASKBOX.JS - COMPLETE FIXED VERSION =====
// Enhanced Task Box Interactions with Context Menu
// Replace your entire taskbox.js file with this

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
            if (e.target.closest('.resize-handle')) {
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

        console.log('📋 Showing context menu for task:', taskId);

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

        // Define menu items
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
                icon: '📌',
                text: 'Pin Task',
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

    // Placeholder functions for menu items
    duplicateTask(taskId) {
        const task = this.tasks ? this.tasks.find(t => t.id == taskId) : null;

        if (task) {
            if (this.showNotification) {
                this.showNotification('Duplicate feature coming soon!', 'info');
            }
        }
    },

    pinTask(taskId, taskCard) {
        // Toggle pinned state
        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');
        const index = pinned.indexOf(taskId);

        if (index > -1) {
            pinned.splice(index, 1);
            taskCard.classList.remove('pinned');
            if (this.showNotification) {
                this.showNotification('Task unpinned', 'info');
            }
        } else {
            pinned.push(taskId);
            taskCard.classList.add('pinned');
            if (this.showNotification) {
                this.showNotification('Task pinned!', 'success');
            }
        }

        localStorage.setItem('taskflow-pinned-tasks', JSON.stringify(pinned));
    },

    showColorPicker(taskCard) {
        if (this.showNotification) {
            this.showNotification('Color picker coming soon!', 'info');
        }
    },

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

    animateNewTask(taskCard) {
        taskCard.classList.add('new-task');
        setTimeout(() => {
            taskCard.classList.remove('new-task');
        }, 2000);
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