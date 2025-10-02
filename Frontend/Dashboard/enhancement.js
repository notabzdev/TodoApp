// Enhanced Fluid Mode Task Boxes - enhanced-taskboxes.js
// Add this as a new file for better task design and resizing in fluid mode

(function() {
    'use strict';

    console.log('Loading enhanced fluid mode task boxes...');

    function initEnhancedTaskboxes() {
        if (!window.dashboard) {
            setTimeout(initEnhancedTaskboxes, 500);
            return;
        }

        console.log('Applying enhanced task box designs...');

        addEnhancedCSS();
        addAdvancedResizing();
        addTaskBoxEnhancements();
        hookIntoFluidMode();
    }

    function addEnhancedCSS() {
        if (document.getElementById('enhanced-taskboxes-css')) return;

        const css = document.createElement('style');
        css.id = 'enhanced-taskboxes-css';
        css.textContent = `
            /* Enhanced Fluid Mode Task Cards */
            body.fluid-mode .task-card {
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                overflow: visible;
                position: relative;
            }
            
            body.fluid-mode .task-card:hover {
                transform: translateY(-4px) scale(1.02);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                border-color: var(--accent-primary);
            }
            
            body.fluid-mode .task-card.dragging {
                transform: rotate(3deg) scale(1.05);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
                z-index: 1000;
                border-color: var(--accent-secondary);
            }
            
            /* Enhanced Resize Handle */
            .enhanced-resize-handle {
                position: absolute;
                bottom: -8px;
                right: -8px;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                cursor: se-resize;
                border-radius: 50%;
                opacity: 0;
                z-index: 1002;
                color: white;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                user-select: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                border: 2px solid white;
            }
            
            .task-card:hover .enhanced-resize-handle {
                opacity: 0.8;
                transform: scale(1);
            }
            
            .enhanced-resize-handle:hover {
                opacity: 1 !important;
                transform: scale(1.2) !important;
                box-shadow: 0 6px 20px rgba(219, 39, 119, 0.4);
            }
            
            .enhanced-resize-handle.resizing {
                opacity: 1 !important;
                transform: scale(1.3) !important;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
                background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
            }
            
            /* Resize Dimensions Display */
            .resize-dimensions-display {
                position: absolute;
                bottom: -45px;
                right: -10px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                opacity: 0;
                pointer-events: none;
                z-index: 1003;
                white-space: nowrap;
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }
            
            .enhanced-resize-handle.resizing + .resize-dimensions-display {
                opacity: 1;
                transform: translateY(-5px);
            }
            
            /* Task Card Content Enhancements */
            body.fluid-mode .task-card .task-title {
                font-size: 1.2rem;
                font-weight: 700;
                background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.8rem;
                line-height: 1.3;
            }
            
            body.fluid-mode .task-card .task-description {
                color: var(--text-secondary);
                line-height: 1.5;
                margin-bottom: 1rem;
                font-size: 0.95rem;
            }
            
            /* Enhanced Task Meta Section */
            body.fluid-mode .task-meta {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 0.8rem;
                margin-top: 1rem;
                border: 1px solid var(--border-color);
                backdrop-filter: blur(10px);
            }
            
            body.fluid-mode .task-priority {
                padding: 0.4rem 0.8rem;
                border-radius: 16px;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: 1px solid currentColor;
            }
            
            /* Enhanced Priority Colors */
            body.fluid-mode .priority-high {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            body.fluid-mode .priority-medium {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            
            body.fluid-mode .priority-low {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            
            /* Task Type Indicators */
            body.fluid-mode .task-card::before {
                content: '';
                position: absolute;
                top: -6px;
                left: 20px;
                width: 40px;
                height: 6px;
                background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
                border-radius: 3px;
                opacity: 0.8;
            }
            
            body.fluid-mode .task-card.task-group::before {
                background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
                width: 60px;
            }
            
            /* Enhanced Hover Effects */
            body.fluid-mode .task-card::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                opacity: 0;
                border-radius: inherit;
                z-index: -1;
                transition: opacity 0.3s ease;
            }
            
            body.fluid-mode .task-card:hover::after {
                opacity: 0.05;
            }
            
            /* Enhanced Action Buttons */
            body.fluid-mode .task-actions {
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
            }
            
            body.fluid-mode .task-card:hover .task-actions {
                opacity: 1;
                transform: translateY(0);
            }
            
            body.fluid-mode .task-action-btn {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 0.5rem;
                transition: all 0.3s ease;
            }
            
            body.fluid-mode .task-action-btn:hover {
                background: var(--accent-primary);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
            }
            
            /* Completion Button Enhancement */
            body.fluid-mode .complete-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 2px solid var(--border-color);
                transition: all 0.3s ease;
            }
            
            body.fluid-mode .complete-btn:hover {
                background: var(--accent-secondary);
                border-color: var(--accent-secondary);
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }
            
            body.fluid-mode .task-card.completed .complete-btn {
                background: var(--accent-secondary);
                border-color: var(--accent-secondary);
                color: white;
            }
            
            /* Enhanced Group Tasks */
            body.fluid-mode .task-card.task-group {
                border: 2px solid var(--accent-primary);
                background: linear-gradient(135deg, var(--card-bg), rgba(219, 39, 119, 0.05));
            }
            
            body.fluid-mode .task-card.task-group .task-title {
                font-size: 1.4rem;
                color: var(--accent-primary);
            }
            
            /* Collision Warning Enhancement */
            body.fluid-mode .task-card.collision-warning {
                border: 3px solid #ef4444 !important;
                box-shadow: 0 0 30px rgba(239, 68, 68, 0.8) !important;
                background: rgba(239, 68, 68, 0.1) !important;
                animation: pulse-warning 0.5s ease-in-out infinite alternate;
            }
            
            @keyframes pulse-warning {
                from { transform: scale(1) rotate(0deg); }
                to { transform: scale(1.02) rotate(1deg); }
            }
            
            /* Enhanced Context Menu */
            .enhanced-context-menu {
                background: var(--card-bg);
                backdrop-filter: blur(30px);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                min-width: 180px;
                overflow: hidden;
            }
            
            .enhanced-menu-item {
                padding: 12px 16px;
                border-radius: 12px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 500;
                position: relative;
                overflow: hidden;
            }
            
            .enhanced-menu-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .enhanced-menu-item:hover {
                background: var(--accent-primary);
                color: white;
                transform: translateX(5px);
            }
            
            .enhanced-menu-item:hover::before {
                left: 100%;
            }
            
            /* Theme-specific Enhancements */
            .theme-galactic.fluid-mode .task-card {
                border-color: rgba(219, 39, 119, 0.3);
                box-shadow: 0 8px 32px rgba(219, 39, 119, 0.1);
            }
            
            .theme-dark.fluid-mode .task-card {
                border-color: rgba(139, 92, 246, 0.3);
                box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
            }
            
            .theme-nature.fluid-mode .task-card {
                border-color: rgba(132, 204, 22, 0.3);
                box-shadow: 0 8px 32px rgba(132, 204, 22, 0.1);
            }
        `;
        document.head.appendChild(css);
    }

    function addAdvancedResizing() {
        window.addEnhancedResizeHandle = function(taskCard) {
            if (taskCard.querySelector('.enhanced-resize-handle')) return;

            const handle = document.createElement('div');
            handle.className = 'enhanced-resize-handle';
            handle.innerHTML = '⋱';
            handle.title = 'Resize task';

            const dimensions = document.createElement('div');
            dimensions.className = 'resize-dimensions-display';

            let isResizing = false;

            handle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();

                isResizing = true;
                handle.classList.add('resizing');
                taskCard.classList.add('safe-resizing');

                const startY = e.clientY;
                const startHeight = taskCard.offsetHeight;
                const startWidth = taskCard.offsetWidth;

                const isGroup = taskCard.classList.contains('task-group');
                const minHeight = isGroup ? 250 : 180;
                const maxHeight = isGroup ? 600 : 450;

                document.body.style.cursor = 'se-resize';
                document.body.style.userSelect = 'none';

                dimensions.style.opacity = '1';
                dimensions.textContent = `${startWidth} × ${startHeight}px`;

                function handleMouseMove(e) {
                    if (!isResizing) return;

                    const deltaY = e.clientY - startY;
                    let newHeight = startHeight + deltaY;
                    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

                    taskCard.style.height = newHeight + 'px';
                    dimensions.textContent = `${startWidth} × ${newHeight}px`;

                    // Add subtle scaling effect during resize
                    const scale = 1 + (Math.abs(deltaY) / 1000);
                    taskCard.style.transform = `scale(${Math.min(scale, 1.05)})`;
                }

                function handleMouseUp() {
                    if (!isResizing) return;

                    isResizing = false;
                    handle.classList.remove('resizing');
                    taskCard.classList.remove('safe-resizing');

                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                    dimensions.style.opacity = '0';

                    // Reset transform
                    taskCard.style.transform = '';

                    const finalHeight = taskCard.offsetHeight;
                    console.log(`Enhanced resize: Task ${taskCard.dataset.taskId} → ${finalHeight}px`);

                    // Save to localStorage if dashboard available
                    if (window.dashboard && window.dashboard.currentUser) {
                        const key = `taskflow-enhanced-sizes-${window.dashboard.currentUser.id}`;
                        const sizes = JSON.parse(localStorage.getItem(key) || '{}');
                        sizes[taskCard.dataset.taskId] = finalHeight;
                        localStorage.setItem(key, JSON.stringify(sizes));
                    }

                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });

            taskCard.appendChild(handle);
            taskCard.appendChild(dimensions);

            // Load saved size
            loadEnhancedTaskSize(taskCard);
        };
    }

    function loadEnhancedTaskSize(taskCard) {
        if (!window.dashboard || !window.dashboard.currentUser) return;

        const key = `taskflow-enhanced-sizes-${window.dashboard.currentUser.id}`;
        const sizes = JSON.parse(localStorage.getItem(key) || '{}');
        const savedHeight = sizes[taskCard.dataset.taskId];

        if (savedHeight) {
            taskCard.style.height = savedHeight + 'px';
            console.log(`Loaded enhanced size for task ${taskCard.dataset.taskId}: ${savedHeight}px`);
        }
    }

    function addTaskBoxEnhancements() {
        window.enhanceFluidTaskBox = function(taskCard) {
            if (taskCard.dataset.fluidEnhanced) return;

            // Add enhanced resize handle
            window.addEnhancedResizeHandle(taskCard);

            // Add enhanced context menu
            addEnhancedContextMenu(taskCard);

            // Add hover effects
            addTaskHoverEffects(taskCard);

            taskCard.dataset.fluidEnhanced = 'true';
        };
    }

    function addEnhancedContextMenu(taskCard) {
        taskCard.addEventListener('contextmenu', function(e) {
            if (e.target.closest('.enhanced-resize-handle') ||
                taskCard.classList.contains('dragging') ||
                document.querySelector('.task-card.dragging')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            showEnhancedContextMenu(e, taskCard);
        });
    }

    function showEnhancedContextMenu(e, taskCard) {
        const existing = document.querySelector('.enhanced-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'enhanced-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            z-index: 2000;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 14px;
            opacity: 0;
            transform: scale(0.9) translateY(10px);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        const menuItems = [
            { icon: '🎨', text: 'Crimson Red', action: () => applyEnhancedColor(taskCard, 'red') },
            { icon: '💙', text: 'Ocean Blue', action: () => applyEnhancedColor(taskCard, 'blue') },
            { icon: '💚', text: 'Forest Green', action: () => applyEnhancedColor(taskCard, 'green') },
            { icon: '💜', text: 'Royal Purple', action: () => applyEnhancedColor(taskCard, 'purple') },
            { icon: '🔥', text: 'Make Priority High', action: () => enhancePriority(taskCard) },
            { icon: '📌', text: 'Pin Task', action: () => toggleEnhancedPin(taskCard) },
            { icon: '📏', text: 'Reset Size', action: () => resetEnhancedSize(taskCard) },
            { icon: '✨', text: 'Reset All Styles', action: () => resetAllEnhanced(taskCard) }
        ];

        menuItems.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'enhanced-menu-item';
            menuItem.innerHTML = `<span>${item.icon}</span><span>${item.text}</span>`;
            menuItem.style.animationDelay = `${index * 50}ms`;

            menuItem.addEventListener('click', () => {
                item.action();
                menu.style.opacity = '0';
                menu.style.transform = 'scale(0.9) translateY(10px)';
                setTimeout(() => menu.remove(), 300);
            });

            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Animate in
        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1) translateY(0)';
        });

        // Position adjustment
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (e.clientX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (e.clientY - rect.height) + 'px';
        }

        // Close handler
        setTimeout(() => {
            function closeHandler(e) {
                if (!menu.contains(e.target)) {
                    menu.style.opacity = '0';
                    menu.style.transform = 'scale(0.9) translateY(10px)';
                    setTimeout(() => menu.remove(), 300);
                    document.removeEventListener('click', closeHandler);
                }
            }
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    function applyEnhancedColor(taskCard, color) {
        const colors = {
            red: {
                bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                border: '#ef4444',
                shadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
            },
            blue: {
                bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))',
                border: '#3b82f6',
                shadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            },
            green: {
                bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))',
                border: '#22c55e',
                shadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
            },
            purple: {
                bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))',
                border: '#8b5cf6',
                shadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
            }
        };

        if (colors[color]) {
            taskCard.style.background = colors[color].bg;
            taskCard.style.borderColor = colors[color].border;
            taskCard.style.boxShadow = colors[color].shadow;
            console.log(`Applied enhanced ${color} theme`);
        }
    }

    function addTaskHoverEffects(taskCard) {
        let hoverTimeout;

        taskCard.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                if (!taskCard.classList.contains('dragging')) {
                    taskCard.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }
            }, 100);
        });

        taskCard.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
    }

    function enhancePriority(taskCard) {
        const priorityElement = taskCard.querySelector('.task-priority');
        if (priorityElement) {
            priorityElement.className = 'task-priority priority-high';
            priorityElement.textContent = 'HIGH';
            console.log('Enhanced priority to HIGH');
        }
    }

    function toggleEnhancedPin(taskCard) {
        const isPinned = taskCard.style.border && taskCard.style.border.includes('3px solid #f59e0b');

        if (isPinned) {
            taskCard.style.border = '';
            console.log('Enhanced pin removed');
        } else {
            taskCard.style.border = '3px solid #f59e0b';
            taskCard.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.5)';
            console.log('Enhanced pin applied');
        }
    }

    function resetEnhancedSize(taskCard) {
        taskCard.style.height = '';

        if (window.dashboard && window.dashboard.currentUser) {
            const key = `taskflow-enhanced-sizes-${window.dashboard.currentUser.id}`;
            const sizes = JSON.parse(localStorage.getItem(key) || '{}');
            delete sizes[taskCard.dataset.taskId];
            localStorage.setItem(key, JSON.stringify(sizes));
        }

        console.log('Enhanced size reset');
    }

    function resetAllEnhanced(taskCard) {
        taskCard.style.background = '';
        taskCard.style.borderColor = '';
        taskCard.style.height = '';
        taskCard.style.border = '';
        taskCard.style.boxShadow = '';
        taskCard.style.transform = '';

        resetEnhancedSize(taskCard);
        console.log('All enhanced styles reset');
    }

    function hookIntoFluidMode() {
        // Apply enhancements when tasks are rendered in fluid mode
        const applyToFluidTasks = () => {
            if (window.dashboard && window.dashboard.fluidModeEnabled) {
                document.querySelectorAll('.task-card').forEach(taskCard => {
                    if (!taskCard.dataset.fluidEnhanced) {
                        window.enhanceFluidTaskBox(taskCard);
                    }
                });
            }
        };

        // Hook into existing rendering
        if (window.dashboard && window.dashboard.renderTasks) {
            const originalRender = window.dashboard.renderTasks;
            window.dashboard.renderTasks = function() {
                originalRender.call(this);
                setTimeout(applyToFluidTasks, 300);
            };
        }

        if (window.dashboard && window.dashboard.renderFilteredTasks) {
            const originalFilteredRender = window.dashboard.renderFilteredTasks;
            window.dashboard.renderFilteredTasks = function(filteredTasks) {
                originalFilteredRender.call(this, filteredTasks);
                setTimeout(applyToFluidTasks, 300);
            };
        }

        // Apply to existing tasks
        setTimeout(applyToFluidTasks, 1000);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedTaskboxes);
    } else {
        initEnhancedTaskboxes();
    }

    console.log('Enhanced fluid mode task boxes loaded');

})();