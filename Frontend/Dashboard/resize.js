Object.assign(TaskFlowDashboard.prototype, {
    initTaskResize() {
        console.log('✅ Initializing task resize');
        this.taskSizes = new Map();
        this.defaultTaskSizes = new Map(); // Store original sizes
        this.loadTaskSizesFromStorage();
    },

    addResizeHandle(taskCard) {
        if (taskCard.querySelector('.resize-handle')) return;

        // CRITICAL: Capture and store the natural rendered size
        const computedStyle = window.getComputedStyle(taskCard);
        const defaultHeight = parseInt(computedStyle.height);
        const defaultWidth = parseInt(computedStyle.width);

        // Store default size for this task
        const taskId = taskCard.dataset.taskId;
        if (!this.defaultTaskSizes.has(taskId)) {
            this.defaultTaskSizes.set(taskId, { width: defaultWidth, height: defaultHeight });
        }

        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.innerHTML = '⋱';
        handle.title = 'Resize height';
        handle.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 20px;
            height: 20px;
            cursor: ns-resize;
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        `;

        const tooltip = document.createElement('div');
        tooltip.className = 'resize-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            bottom: 25px;
            right: 0;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            opacity: 0;
            pointer-events: none;
            white-space: nowrap;
        `;

        taskCard.appendChild(handle);
        taskCard.appendChild(tooltip);

        let isResizing = false;
        let startY, startHeight;

        // STRICT minimum based on actual default
        const ABSOLUTE_MIN_HEIGHT = defaultHeight;
        const MAX_HEIGHT = 800;

        taskCard.addEventListener('mouseenter', () => {
            if (!isResizing) handle.style.opacity = '0.7';
        });

        taskCard.addEventListener('mouseleave', () => {
            if (!isResizing) handle.style.opacity = '0';
        });

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            startY = e.clientY;
            startHeight = taskCard.offsetHeight;

            handle.style.opacity = '1';
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
            tooltip.style.opacity = '1';

            const onMouseMove = (e) => {
                if (!isResizing) return;

                const deltaY = e.clientY - startY;
                let newHeight = startHeight + deltaY;

                // ENFORCE strict minimum
                if (newHeight < ABSOLUTE_MIN_HEIGHT) {
                    newHeight = ABSOLUTE_MIN_HEIGHT;
                }
                if (newHeight > MAX_HEIGHT) {
                    newHeight = MAX_HEIGHT;
                }

                taskCard.style.height = newHeight + 'px';
                tooltip.textContent = `${Math.round(newHeight)}px`;

                // Visual feedback at minimum
                if (newHeight <= ABSOLUTE_MIN_HEIGHT) {
                    tooltip.style.background = 'rgba(239, 68, 68, 0.9)';
                } else {
                    tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
                }
            };

            const onMouseUp = () => {
                if (!isResizing) return;

                isResizing = false;
                handle.style.opacity = '0';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                tooltip.style.opacity = '0';
                tooltip.style.background = 'rgba(0, 0, 0, 0.9)';

                this.saveTaskSize(taskCard, taskCard.offsetHeight);

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        handle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    },

    addBidirectionalResizeHandle(taskCard) {
        const oldHandle = taskCard.querySelector('.resize-handle, .resize-handle-bidirectional');
        if (oldHandle) oldHandle.remove();

        // CRITICAL: Capture actual rendered size
        const computedStyle = window.getComputedStyle(taskCard);
        const defaultHeight = parseInt(computedStyle.height);
        const defaultWidth = parseInt(computedStyle.width);

        const taskId = taskCard.dataset.taskId;
        if (!this.defaultTaskSizes.has(taskId)) {
            this.defaultTaskSizes.set(taskId, { width: defaultWidth, height: defaultHeight });
        }

        const handle = document.createElement('div');
        handle.className = 'resize-handle-bidirectional';
        handle.innerHTML = '⋰';
        handle.title = 'Resize';
        handle.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 20px;
            height: 20px;
            cursor: nwse-resize;
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        `;

        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            bottom: 25px;
            right: 0;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            opacity: 0;
            pointer-events: none;
            white-space: nowrap;
        `;

        taskCard.appendChild(handle);
        taskCard.appendChild(tooltip);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        // STRICT minimums based on actual defaults
        const ABSOLUTE_MIN_WIDTH = defaultWidth;
        const ABSOLUTE_MIN_HEIGHT = defaultHeight;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        taskCard.addEventListener('mouseenter', () => {
            if (!isResizing) handle.style.opacity = '0.7';
        });

        taskCard.addEventListener('mouseleave', () => {
            if (!isResizing) handle.style.opacity = '0';
        });

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
            document.body.style.userSelect = 'none';
            tooltip.style.opacity = '1';

            const onMouseMove = (e) => {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                let newWidth = startWidth + deltaX;
                let newHeight = startHeight + deltaY;

                // ENFORCE strict minimums
                if (newWidth < ABSOLUTE_MIN_WIDTH) newWidth = ABSOLUTE_MIN_WIDTH;
                if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
                if (newHeight < ABSOLUTE_MIN_HEIGHT) newHeight = ABSOLUTE_MIN_HEIGHT;
                if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;

                taskCard.style.width = newWidth + 'px';
                taskCard.style.height = newHeight + 'px';
                tooltip.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}px`;

                // Visual feedback at minimums
                if (newWidth <= ABSOLUTE_MIN_WIDTH || newHeight <= ABSOLUTE_MIN_HEIGHT) {
                    tooltip.style.background = 'rgba(239, 68, 68, 0.9)';
                } else {
                    tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
                }
            };

            const onMouseUp = () => {
                if (!isResizing) return;

                isResizing = false;
                handle.style.opacity = '0';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                tooltip.style.opacity = '0';
                tooltip.style.background = 'rgba(0, 0, 0, 0.9)';

                this.saveBidirectionalSize(taskCard, taskCard.offsetWidth, taskCard.offsetHeight);

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    saveTaskSize(taskCard, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        this.taskSizes.set(taskId, {
            height,
            timestamp: Date.now(),
            userId: this.currentUser.id
        });

        this.saveTaskSizesToStorage();
    },

    saveBidirectionalSize(taskCard, width, height) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.currentUser) return;

        this.taskSizes.set(taskId, {
            width,
            height,
            timestamp: Date.now(),
            userId: this.currentUser.id
        });

        this.saveTaskSizesToStorage();
    },

    loadTaskSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.taskSizes) return;

        const saved = this.taskSizes.get(taskId);
        if (saved?.height) {
            taskCard.style.height = saved.height + 'px';
        }
    },

    loadBidirectionalSize(taskCard) {
        const taskId = taskCard.dataset.taskId;
        if (!taskId || !this.taskSizes) return;

        const saved = this.taskSizes.get(taskId);
        if (saved) {
            if (saved.width) taskCard.style.width = saved.width + 'px';
            if (saved.height) taskCard.style.height = saved.height + 'px';
        }
    },

    saveTaskSizesToStorage() {
        if (!this.currentUser || !this.taskSizes) return;

        const key = `taskflow-task-sizes-${this.currentUser.id}`;
        const data = Object.fromEntries(this.taskSizes);
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadTaskSizesFromStorage() {
        if (!this.currentUser) return;

        const key = `taskflow-task-sizes-${this.currentUser.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            const data = JSON.parse(saved);
            this.taskSizes = new Map(Object.entries(data));
            console.log(`Loaded ${this.taskSizes.size} saved sizes`);
        } else {
            this.taskSizes = new Map();
        }
    },

    resetTaskSize(taskId) {
        this.taskSizes.delete(taskId);
        this.saveTaskSizesToStorage();

        const card = document.querySelector(`[data-task-id="${taskId}"]`);
        if (card) {
            card.style.height = '';
            card.style.width = '';
        }

        if (this.showNotification) {
            this.showNotification('Size reset', 'info');
        }
    },

    enhanceTaskWithResize(taskCard) {
        this.addResizeHandle(taskCard);
        this.loadTaskSize(taskCard);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dashboard?.initTaskResize) {
            window.dashboard.initTaskResize();
            console.log('✅ Resize ready');
        }
    }, 1000);
});