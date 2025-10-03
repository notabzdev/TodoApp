// ===== TASKBOX.JS - OPTIMIZED & CLEAN =====
// Enhanced Task Box Interactions with Context Menu Features
// Replace your entire taskbox.js with this optimized version

Object.assign(TaskFlowDashboard.prototype, {
    // ========== INITIALIZATION ==========
    initTaskBoxEnhancements() {
        console.log('Initializing task box enhancements');
        this.expandedGroups = new Set();
        this.contextMenuOpen = false;
    },

    // ========== TASK ENHANCEMENT ==========
    enhanceTaskCard(taskCard) {
        if (!taskCard || taskCard.dataset.enhanced) return;

        this.addContextMenuToTask(taskCard);
        this.addVisualEffects(taskCard);
        taskCard.dataset.enhanced = 'true';
    },

    addContextMenuToTask(taskCard) {
        if (taskCard._contextMenuHandler) {
            taskCard.removeEventListener('contextmenu', taskCard._contextMenuHandler);
        }

        const handler = (e) => {
            // Ignore if clicking on interactive elements
            if (e.target.closest('.resize-handle, .resize-handle-bidirectional, button, input, [contenteditable="true"]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            this.showTaskContextMenu(taskCard, e.clientX, e.clientY);
        };

        taskCard._contextMenuHandler = handler;
        taskCard.addEventListener('contextmenu', handler);
    },

    // ========== CONTEXT MENU ==========
    showTaskContextMenu(taskCard, x, y) {
        const taskId = taskCard.dataset.taskId;
        const isGroup = taskCard.classList.contains('task-group');
        const isPinned = taskCard.classList.contains('pinned');

        this.contextMenuOpen = true;
        this.hideContextMenu(); // Remove any existing menu

        const menu = this.createContextMenu(x, y);
        const menuItems = this.getContextMenuItems(taskId, taskCard, isGroup, isPinned);

        this.populateContextMenu(menu, menuItems);
        this.positionContextMenu(menu, x, y);
        this.setupContextMenuClosing(menu);
    },

    createContextMenu(x, y) {
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
        document.body.appendChild(menu);

        // Animate in
        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
        });

        return menu;
    },

    getContextMenuItems(taskId, taskCard, isGroup, isPinned) {
        const items = [
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
                action: () => this.duplicateTask(taskId)
            },
            {
                icon: isPinned ? '📍' : '📌',
                text: isPinned ? 'Unpin Task' : 'Pin Task',
                action: () => this.pinTask(taskId, taskCard)
            },
            {
                icon: '🎨',
                text: 'Change Color',
                action: () => this.showColorPicker(taskCard)
            },
            {
                icon: '📐',
                text: 'Reset Size',
                action: () => {
                    if (this.resetTaskSize) {
                        this.resetTaskSize(taskId);
                        this.showNotification('Task size reset', 'success');
                    }
                }
            },
            {
                icon: '🗑️',
                text: 'Delete Task',
                action: () => {
                    if (confirm('Delete this task?')) {
                        this.deleteTask(taskId);
                    }
                },
                danger: true
            }
        ];

        // Add expand/collapse for group tasks
        if (isGroup) {
            items.splice(3, 0, {
                icon: '📂',
                text: this.expandedGroups.has(taskId) ? 'Collapse' : 'Expand',
                action: () => this.toggleGroupExpansion(taskCard)
            });
        }

        return items;
    },

    populateContextMenu(menu, menuItems) {
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

            // Hover effects
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = item.danger ?
                    'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)';
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
                if (item.action) item.action();
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
    },

    positionContextMenu(menu, x, y) {
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (y - rect.height) + 'px';
        }
    },

    setupContextMenuClosing(menu) {
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
            setTimeout(() => menu.remove(), 200);
        }
        this.contextMenuOpen = false;
    },

    // ========== PIN FEATURE ==========
    pinTask(taskId, taskCard) {
        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');
        const index = pinned.indexOf(taskId);
        const isPinned = index > -1;

        if (isPinned) {
            this.unpinTask(taskId, taskCard, pinned, index);
        } else {
            this.pinTaskAction(taskId, taskCard, pinned);
        }

        localStorage.setItem('taskflow-pinned-tasks', JSON.stringify(pinned));

        if (!document.body.classList.contains('fluid-mode')) {
            this.sortTasksByPinned();
        }
    },

    unpinTask(taskId, taskCard, pinned, index) {
        pinned.splice(index, 1);
        taskCard.classList.remove('pinned');

        if (document.body.classList.contains('fluid-mode')) {
            taskCard.style.cursor = 'grab';
            taskCard.title = '';

            if (window.dashboard.makeSingleTaskDraggable && taskCard._cleanupDraggable) {
                taskCard._cleanupDraggable();
                delete taskCard._cleanupDraggable;
                delete taskCard._isDraggable;
                window.dashboard.makeSingleTaskDraggable(taskCard);
            }
        }

        if (this.showNotification) {
            this.showNotification('Task unpinned - you can now move it', 'info');
        }
    },

    pinTaskAction(taskId, taskCard, pinned) {
        pinned.push(taskId);
        taskCard.classList.add('pinned');

        if (document.body.classList.contains('fluid-mode')) {
            taskCard.style.cursor = 'not-allowed';
            taskCard.title = 'Task is pinned - right-click to unpin';

            if (taskCard._cleanupDraggable) {
                taskCard._cleanupDraggable();
                delete taskCard._cleanupDraggable;
                delete taskCard._isDraggable;
            }
        }

        if (this.showNotification) {
            this.showNotification('Task pinned! Position locked', 'success');
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

        if (this.renderTasks) this.renderTasks();
    },

    loadPinnedStates() {
        const pinned = JSON.parse(localStorage.getItem('taskflow-pinned-tasks') || '[]');
        document.querySelectorAll('.task-card').forEach(card => {
            if (pinned.includes(card.dataset.taskId)) {
                card.classList.add('pinned');
            }
        });
    },

    // ========== COLOR PICKER ==========
    showColorPicker(taskCard) {
        const taskId = taskCard.dataset.taskId;
        const existingPicker = document.getElementById('task-color-picker');
        if (existingPicker) existingPicker.remove();

        const picker = this.createColorPickerModal();
        const colors = this.getColorOptions();

        this.populateColorGrid(picker, colors, taskCard, taskId);
        this.setupColorPickerClosing(picker);

        document.body.appendChild(picker);
        requestAnimationFrame(() => {
            picker.style.opacity = '1';
            picker.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    },

    createColorPickerModal() {
        const picker = document.createElement('div');
        picker.id = 'task-color-picker';
        picker.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg, #1f2937);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            border-radius: 16px;
            padding: 24px;
            z-index: 2500;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            min-width: 320px;
            color: var(--text-primary, white);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        picker.innerHTML = `
            <h3 style="margin: 0 0 16px 0; font-size: 1.2rem; font-weight: 600;">Choose Task Color</h3>
            <div id="color-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;"></div>
            <button id="color-picker-cancel" style="
                width: 100%;
                padding: 10px;
                background: rgba(255,255,255,0.1);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-size: 0.95rem;
                transition: all 0.2s ease;
            ">Cancel</button>
        `;
        return picker;
    },

    getColorOptions() {
        return [
            { name: 'Default', bg: 'linear-gradient(135deg, #1f2937, #111827)', border: '#374151', shadow: 'none', value: 'default' },
            { name: '🔴 Crimson Red', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15))', border: '#ef4444', shadow: '0 8px 24px rgba(239, 68, 68, 0.3)', value: 'red' },
            { name: '🔵 Ocean Blue', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))', border: '#3b82f6', shadow: '0 8px 24px rgba(59, 130, 246, 0.3)', value: 'blue' },
            { name: '🟢 Forest Green', bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(22, 163, 74, 0.15))', border: '#22c55e', shadow: '0 8px 24px rgba(34, 197, 94, 0.3)', value: 'green' },
            { name: '🟣 Royal Purple', bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(124, 58, 237, 0.15))', border: '#8b5cf6', shadow: '0 8px 24px rgba(139, 92, 246, 0.3)', value: 'purple' },
            { name: '🟡 Golden Yellow', bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.15))', border: '#fbbf24', shadow: '0 8px 24px rgba(251, 191, 36, 0.3)', value: 'yellow' },
            { name: '🟠 Sunset Orange', bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(234, 88, 12, 0.15))', border: '#f97316', shadow: '0 8px 24px rgba(249, 115, 22, 0.3)', value: 'orange' },
            { name: '💗 Pink Blush', bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(219, 39, 119, 0.15))', border: '#ec4899', shadow: '0 8px 24px rgba(236, 72, 153, 0.3)', value: 'pink' }
        ];
    },

    populateColorGrid(picker, colors, taskCard, taskId) {
        const colorGrid = picker.querySelector('#color-grid');

        colors.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.style.cssText = `
                padding: 16px;
                background: ${color.bg};
                border: 2px solid ${color.border};
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                font-weight: 500;
                font-size: 0.9rem;
                box-shadow: ${color.shadow};
                opacity: 0;
                transform: translateY(10px);
            `;
            colorOption.textContent = color.name;

            setTimeout(() => {
                colorOption.style.opacity = '1';
                colorOption.style.transform = 'translateY(0)';
            }, index * 50);

            colorOption.addEventListener('mouseenter', () => {
                colorOption.style.transform = 'scale(1.05) translateY(-2px)';
            });

            colorOption.addEventListener('mouseleave', () => {
                colorOption.style.transform = 'scale(1) translateY(0)';
            });

            colorOption.addEventListener('click', () => {
                this.applyTaskColor(taskCard, taskId, color);
                picker.style.opacity = '0';
                picker.style.transform = 'translate(-50%, -50%) scale(0.9)';
                setTimeout(() => picker.remove(), 300);
            });

            colorGrid.appendChild(colorOption);
        });

        picker.querySelector('#color-picker-cancel').addEventListener('click', () => {
            picker.style.opacity = '0';
            picker.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => picker.remove(), 300);
        });
    },

    setupColorPickerClosing(picker) {
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!picker.contains(e.target)) {
                    picker.style.opacity = '0';
                    picker.style.transform = 'translate(-50%, -50%) scale(0.9)';
                    setTimeout(() => picker.remove(), 300);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    },

    applyTaskColor(taskCard, taskId, color) {
        // Apply visual styles immediately
        taskCard.style.background = color.bg;
        taskCard.style.borderColor = color.border;
        taskCard.style.boxShadow = color.shadow;

        // Save to localStorage for persistence
        const savedColors = JSON.parse(localStorage.getItem('taskflow-task-colors') || '{}');
        savedColors[taskId] = color;
        localStorage.setItem('taskflow-task-colors', JSON.stringify(savedColors));

        // Update task object and sync with server
        const task = this.tasks?.find(t => t.id == taskId);
        if (task) {
            // Store the gradient background as the color value for the database
            task.color = color.bg; // Changed from color.value to color.bg
        }

        // Update on server with the full gradient
        this.updateTaskColorOnServer(taskId, color.bg); // Changed to send color.bg

        if (this.showNotification) {
            this.showNotification(`Task color changed to ${color.name}`, 'success');
        }

        console.log('Color applied and saved:', taskId, color.name);
    },

// Update color on server
    async updateTaskColorOnServer(taskId, colorValue) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('sessionToken')
                },
                body: JSON.stringify({
                    color: colorValue // Send the full gradient string
                })
            });

            if (response.ok) {
                console.log('✅ Color saved to database:', taskId);
            } else {
                console.error('❌ Failed to save color to database');
            }
        } catch (error) {
            console.error('❌ Error saving color to server:', error);
        }
    },

    restoreTaskColors() {
        const savedColors = JSON.parse(localStorage.getItem('taskflow-task-colors') || '{}');
        let restoredCount = 0;

        Object.keys(savedColors).forEach(taskId => {
            const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskCard) {
                const color = savedColors[taskId];
                taskCard.style.background = color.bg;
                taskCard.style.borderColor = color.border;
                taskCard.style.boxShadow = color.shadow;
                restoredCount++;
            }
        });

        if (restoredCount > 0) {
            console.log(`Restored colors for ${restoredCount} tasks`);
        }
    },

    // ========== DUPLICATE TASK ==========
    async duplicateTask(taskId) {
        const task = this.tasks?.find(t => t.id == taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        try {
            // Create task data for API (exclude ID - server will generate new one)
            const taskData = {
                title: task.title + ' (Copy)',
                description: task.description || '',
                priority: task.priority,
                dueDate: task.due_date || '',
                type: task.type,
                completed: false // New duplicate starts uncompleted
            };

            // POST to server to create the duplicate
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('sessionToken')
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Failed to duplicate task');
            }

            const result = await response.json();
            console.log('Task duplicated successfully:', result);

            // Reload tasks from server to get the new task with proper ID
            if (this.loadTasks) {
                await this.loadTasks();
            }

            if (this.showNotification) {
                this.showNotification('Task duplicated successfully', 'success');
            }

        } catch (error) {
            console.error('Error duplicating task:', error);
            if (this.showNotification) {
                this.showNotification('Failed to duplicate task', 'error');
            }
        }
    },

    // ========== GROUP EXPANSION ==========
    toggleGroupExpansion(taskCard) {
        const taskId = taskCard.dataset.taskId;
        const subtasksContainer = taskCard.querySelector('.subtasks-container');
        const expandBtn = taskCard.querySelector('.group-expand-btn');

        if (!subtasksContainer) return;

        const isExpanded = subtasksContainer.classList.contains('expanded');

        if (isExpanded) {
            this.collapseGroup(taskId, subtasksContainer, expandBtn);
        } else {
            this.expandGroup(taskId, subtasksContainer, expandBtn);
        }

        localStorage.setItem('taskflow-expanded-groups', JSON.stringify([...this.expandedGroups]));
    },

    collapseGroup(taskId, container, btn) {
        container.classList.remove('expanded');
        container.style.maxHeight = '0';
        container.style.opacity = '0';
        container.style.padding = '0';

        if (btn) {
            btn.innerHTML = '▼';
            btn.classList.remove('expanded');
            btn.style.transform = 'rotate(0deg)';
        }

        this.expandedGroups.delete(taskId);
    },

    expandGroup(taskId, container, btn) {
        container.classList.add('expanded');
        container.style.maxHeight = container.scrollHeight + 'px';
        container.style.opacity = '1';
        container.style.padding = '1rem';

        if (btn) {
            btn.innerHTML = '▲';
            btn.classList.add('expanded');
            btn.style.transform = 'rotate(180deg)';
        }

        this.expandedGroups.add(taskId);
    },

    restoreExpandedGroups() {
        const expandedGroups = JSON.parse(localStorage.getItem('taskflow-expanded-groups') || '[]');
        this.expandedGroups = new Set(expandedGroups);

        expandedGroups.forEach(taskId => {
            const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskCard) {
                const container = taskCard.querySelector('.subtasks-container');
                const btn = taskCard.querySelector('.group-expand-btn');
                if (container) {
                    this.expandGroup(taskId, container, btn);
                }
            }
        });
    },

    // ========== VISUAL EFFECTS ==========
    addVisualEffects(taskCard) {
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
    }
});

// ========== AUTO-INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    const initTaskBox = () => {
        if (window.dashboard?.initTaskBoxEnhancements) {
            window.dashboard.initTaskBoxEnhancements();
            console.log('Task box enhancements initialized');
        } else {
            setTimeout(initTaskBox, 500);
        }
    };
    setTimeout(initTaskBox, 1000);
});