// Enhanced Task Box Interactions - FIXED VERSION
// Add to TaskFlowDashboard prototype with proper event handling

Object.assign(TaskFlowDashboard.prototype, {
    initTaskBoxEnhancements() {
        this.expandedGroups = new Set();
        this.taskInteractionStates = new Map();
        this.contextMenuOpen = false;
        console.log('Task box enhancements initialized');
    },

    enhanceTaskCard(taskCard) {
        if (!taskCard || taskCard.dataset.enhanced) return;

        const taskId = taskCard.dataset.taskId;
        const isGroup = taskCard.classList.contains('task-group');

        // Clean up any existing enhancements first
        this.cleanupTaskEnhancements(taskCard);

        // Add enhanced interaction listeners
        this.addTaskBoxListeners(taskCard, isGroup);

        // Add visual enhancements
        this.addTaskBoxEffects(taskCard, isGroup);

        taskCard.dataset.enhanced = 'true';
    },

    cleanupTaskEnhancements(taskCard) {
        // Remove existing event listeners by cloning
        const newCard = taskCard.cloneNode(true);
        taskCard.parentNode.replaceChild(newCard, taskCard);
        return newCard;
    },

    addTaskBoxListeners(taskCard, isGroup) {
        const taskId = taskCard.dataset.taskId;

        // Enhanced click effects with proper event isolation
        taskCard.addEventListener('click', (e) => {
            // Skip if clicking interactive elements
            if (e.target.closest('button') ||
                e.target.closest('input') ||
                e.target.closest('.resize-handle') ||
                e.target.closest('[contenteditable="true"]') ||
                this.contextMenuOpen) {
                return;
            }

            this.addClickEffect(taskCard, e);

            if (isGroup) {
                this.toggleGroupExpansion(taskCard);
            }
        });

        // Enhanced hover effects
        taskCard.addEventListener('mouseenter', () => {
            if (!this.contextMenuOpen && !document.querySelector('.resize-handle.resizing')) {
                this.addHoverEffect(taskCard);
            }
        });

        taskCard.addEventListener('mouseleave', () => {
            if (!this.contextMenuOpen) {
                this.removeHoverEffect(taskCard);
            }
        });

        // Double click for quick edit
        taskCard.addEventListener('dblclick', (e) => {
            if (e.target.closest('button') || e.target.closest('.resize-handle')) return;
            e.preventDefault();
            this.quickEditTask(taskCard);
        });

        // Context menu with proper event handling
        taskCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Don't show if clicking resize handle
            if (e.target.closest('.resize-handle')) return;

            this.showTaskContextMenu(taskCard, e.clientX, e.clientY);
        });

        // Focus effects for accessibility
        taskCard.addEventListener('focus', () => {
            taskCard.classList.add('focus-ring');
        });

        taskCard.addEventListener('blur', () => {
            taskCard.classList.remove('focus-ring');
        });

        // Make focusable
        if (!taskCard.hasAttribute('tabindex')) {
            taskCard.setAttribute('tabindex', '0');
        }
    },

    addTaskBoxEffects(taskCard, isGroup) {
        // Add ripple effect container
        if (!taskCard.querySelector('.ripple-container')) {
            const rippleContainer = document.createElement('div');
            rippleContainer.className = 'ripple-container';
            taskCard.appendChild(rippleContainer);
        }

        // Add task type indicator
        if (!taskCard.querySelector('.task-type-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'task-type-indicator';
            indicator.style.background = isGroup ? 'var(--accent-primary)' : 'var(--accent-secondary)';
            taskCard.appendChild(indicator);
        }
    },

    addClickEffect(taskCard, event) {
        taskCard.classList.add('clicked');

        // Create ripple effect
        const rippleContainer = taskCard.querySelector('.ripple-container');
        if (rippleContainer) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';

            const rect = taskCard.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (event.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (event.clientY - rect.top - size/2) + 'px';

            rippleContainer.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
                taskCard.classList.remove('clicked');
            }, 600);
        }
    },

    addHoverEffect(taskCard) {
        const indicator = taskCard.querySelector('.task-type-indicator');
        if (indicator) {
            indicator.style.transform = 'scale(1.5)';
            indicator.style.boxShadow = '0 0 12px currentColor';
        }
    },

    removeHoverEffect(taskCard) {
        const indicator = taskCard.querySelector('.task-type-indicator');
        if (indicator) {
            indicator.style.transform = '';
            indicator.style.boxShadow = '';
        }
    },

    toggleGroupExpansion(taskCard) {
        const taskId = taskCard.dataset.taskId;
        const isExpanded = this.expandedGroups.has(taskId);

        if (isExpanded) {
            this.collapseGroup(taskCard, taskId);
        } else {
            this.expandGroup(taskCard, taskId);
        }
    },

    expandGroup(taskCard, taskId) {
        taskCard.classList.add('expanded');
        this.expandedGroups.add(taskId);

        // Add expand animation
        taskCard.style.transform = 'scale(1.05)';
        taskCard.style.zIndex = '100';

        // Show subtasks container if it exists
        const subtasksContainer = taskCard.querySelector('.subtasks-container');
        if (subtasksContainer) {
            subtasksContainer.classList.add('expanded');
        }

        // Create expansion overlay effect
        this.createExpansionOverlay(taskCard);

        if (this.showNotification) {
            this.showNotification('Group expanded', 'info');
        }
    },

    collapseGroup(taskCard, taskId) {
        taskCard.classList.remove('expanded');
        this.expandedGroups.delete(taskId);

        // Remove expand animation
        taskCard.style.transform = '';
        taskCard.style.zIndex = '';

        // Hide subtasks container
        const subtasksContainer = taskCard.querySelector('.subtasks-container');
        if (subtasksContainer) {
            subtasksContainer.classList.remove('expanded');
        }

        // Remove expansion overlay
        this.removeExpansionOverlay();

        if (this.showNotification) {
            this.showNotification('Group collapsed', 'info');
        }
    },

    createExpansionOverlay(taskCard) {
        // Create background overlay
        let overlay = document.getElementById('expansion-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'expansion-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 99;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
        }

        overlay.classList.add('active');
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        }, 10);

        // Click overlay to collapse
        overlay.onclick = () => {
            this.collapseGroup(taskCard, taskCard.dataset.taskId);
        };
    },

    removeExpansionOverlay() {
        const overlay = document.getElementById('expansion-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    },

    quickEditTask(taskCard) {
        const taskId = taskCard.dataset.taskId;
        const task = this.tasks ? this.tasks.find(t => t.id == taskId) : null;

        if (task && this.showTaskModal) {
            this.showTaskModal(false, task);
            this.addClickEffect(taskCard, { clientX: 0, clientY: 0 });
        }
    },

    showTaskContextMenu(taskCard, x, y) {
        const taskId = taskCard.dataset.taskId;
        const isGroup = taskCard.classList.contains('task-group');

        // Set context menu state
        this.contextMenuOpen = true;

        // Remove existing context menu
        const existing = document.getElementById('task-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'task-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--card-bg, #1f2937);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            border-radius: 12px;
            padding: 8px;
            z-index: 2000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            min-width: 180px;
            color: var(--text-primary, white);
            font-family: inherit;
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.2s ease;
        `;

        const menuItems = [
            {
                icon: '✏️',
                text: 'Quick Edit',
                action: () => this.quickEditTask(taskCard)
            },
            {
                icon: '📋',
                text: 'Duplicate',
                action: () => this.duplicateTask(taskId)
            },
            {
                icon: '📌',
                text: 'Pin Task',
                action: () => this.pinTask(taskId, taskCard)
            },
            {
                icon: '🎨',
                text: 'Change Color',
                action: () => this.showColorPicker(taskCard)
            },
            {
                icon: '📏',
                text: 'Reset Size',
                action: () => this.resetTaskSize ? this.resetTaskSize(taskId) : null
            },
            {
                icon: '🗑️',
                text: 'Delete',
                action: () => {
                    if (confirm('Delete this task?') && this.deleteTask) {
                        this.deleteTask(taskId);
                    }
                },
                danger: true
            }
        ];

        if (isGroup) {
            menuItems.splice(3, 0, {
                icon: '📂',
                text: this.expandedGroups.has(taskId) ? 'Collapse' : 'Expand',
                action: () => this.toggleGroupExpansion(taskCard)
            });
        }

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item' + (item.danger ? ' danger' : '');
            menuItem.innerHTML = `
                <span class="context-menu-icon">${item.icon}</span>
                <span>${item.text}</span>
            `;

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = item.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)';
                menuItem.style.transform = 'translateX(3px)';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = '';
                menuItem.style.transform = '';
            });

            menuItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.action) item.action();
                this.hideContextMenu();
            });

            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Animate in
        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
        });

        // Adjust position if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (y - rect.height) + 'px';
        }

        // Close menu when clicking outside
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
            menu.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (menu.parentNode) {
                    menu.remove();
                }
            }, 200);
        }
        this.contextMenuOpen = false;
    },

    duplicateTask(taskId) {
        const task = this.tasks ? this.tasks.find(t => t.id == taskId) : null;
        if (!task) return;

        const duplicatedTask = {
            title: task.title + ' (Copy)',
            description: task.description,
            priority: task.priority,
            type: task.type,
            dueDate: task.due_date
        };

        if (this.showTaskModal) {
            this.showTaskModal(task.type === 'group', null);

            // Fill the form
            setTimeout(() => {
                const titleField = document.getElementById('taskTitle');
                const descField = document.getElementById('taskDescription');
                const priorityField = document.getElementById('taskPriority');
                const dateField = document.getElementById('taskDueDate');
                const typeRadios = document.querySelectorAll('input[name="taskType"]');

                if (titleField) titleField.value = duplicatedTask.title;
                if (descField) descField.value = duplicatedTask.description || '';
                if (priorityField) priorityField.value = duplicatedTask.priority;
                if (dateField) dateField.value = duplicatedTask.dueDate || '';

                typeRadios.forEach(radio => {
                    radio.checked = radio.value === duplicatedTask.type;
                });
            }, 100);
        }
    },

    pinTask(taskId, taskCard) {
        const isPinned = taskCard.classList.contains('pinned');

        if (isPinned) {
            taskCard.classList.remove('pinned');
            if (this.showNotification) {
                this.showNotification('Task unpinned', 'info');
            }
        } else {
            taskCard.classList.add('pinned');
            if (this.showNotification) {
                this.showNotification('Task pinned', 'success');
            }
        }
    },

    showColorPicker(taskCard) {
        const colors = [
            { name: 'Default', value: '', bg: 'var(--card-bg)' },
            { name: 'Red', value: 'red', bg: 'rgba(239, 68, 68, 0.2)' },
            { name: 'Blue', value: 'blue', bg: 'rgba(59, 130, 246, 0.2)' },
            { name: 'Green', value: 'green', bg: 'rgba(34, 197, 94, 0.2)' },
            { name: 'Purple', value: 'purple', bg: 'rgba(139, 92, 246, 0.2)' },
            { name: 'Orange', value: 'orange', bg: 'rgba(251, 146, 60, 0.2)' },
            { name: 'Pink', value: 'pink', bg: 'rgba(236, 72, 153, 0.2)' }
        ];

        const picker = document.createElement('div');
        picker.className = 'color-picker-modal';
        picker.innerHTML = `
            <h3 class="color-picker-title">Choose Task Color</h3>
            <div class="color-options-grid">
                ${colors.map(color => `
                    <div class="color-option" data-color="${color.value}" style="
                        background: ${color.bg};
                    " title="${color.name}">
                        ${color.value ? '' : '✨'}
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(picker);

        // Show with animation
        requestAnimationFrame(() => {
            picker.classList.add('show');
        });

        // Add click handlers
        picker.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                this.applyTaskColor(taskCard, color);
                picker.classList.remove('show');
                setTimeout(() => {
                    if (picker.parentNode) {
                        picker.remove();
                    }
                }, 300);
            });

            option.addEventListener('mouseenter', () => {
                option.style.transform = 'scale(1.1)';
                option.style.borderColor = 'var(--accent-primary)';
            });

            option.addEventListener('mouseleave', () => {
                option.style.transform = '';
                option.style.borderColor = 'var(--border-color)';
            });
        });

        // Close on outside click
        setTimeout(() => {
            const closePicker = (e) => {
                if (!picker.contains(e.target)) {
                    picker.classList.remove('show');
                    setTimeout(() => {
                        if (picker.parentNode) {
                            picker.remove();
                        }
                    }, 300);
                    document.removeEventListener('click', closePicker);
                }
            };
            document.addEventListener('click', closePicker);
        }, 100);
    },

    applyTaskColor(taskCard, color) {
        taskCard.dataset.customColor = color;

        const colorStyles = {
            red: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' },
            blue: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' },
            green: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e' },
            purple: { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6' },
            orange: { bg: 'rgba(251, 146, 60, 0.2)', border: '#fb923c' },
            pink: { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899' }
        };

        if (color && colorStyles[color]) {
            taskCard.style.background = colorStyles[color].bg;
            taskCard.style.borderColor = colorStyles[color].border;
        } else {
            taskCard.style.background = '';
            taskCard.style.borderColor = '';
        }

        if (this.showNotification) {
            this.showNotification(`Task color ${color ? 'changed to ' + color : 'reset'}`, 'success');
        }
    },

    // Add new task animation
    animateNewTask(taskCard) {
        taskCard.classList.add('new-task');
        setTimeout(() => {
            taskCard.classList.remove('new-task');
        }, 2000);
    },

    // Enhanced setup integration
    setupTaskBoxInteractions() {
        // Override the original task rendering to include enhancements
        if (this.renderFilteredTasks && !this._originalRenderFilteredTasks) {
            this._originalRenderFilteredTasks = this.renderFilteredTasks;

            this.renderFilteredTasks = function(filteredTasks) {
                this._originalRenderFilteredTasks.call(this, filteredTasks);

                // Enhance all task cards
                setTimeout(() => {
                    document.querySelectorAll('.task-card').forEach(card => {
                        this.enhanceTaskCard(card);
                    });
                }, 100);
            };
        }
    }
});

// Auto-initialize task box enhancements
document.addEventListener('DOMContentLoaded', () => {
    const initTaskBox = () => {
        if (window.dashboard && window.dashboard.initTaskBoxEnhancements) {
            window.dashboard.initTaskBoxEnhancements();
            window.dashboard.setupTaskBoxInteractions();
            console.log('Task box enhancements active');
        } else {
            setTimeout(initTaskBox, 1000);
        }
    };

    setTimeout(initTaskBox, 2000);
});