// ===== CANVASMOVE.JS - Infinite Canvas Drag =====
// Built from scratch - clean implementation

(function() {
    'use strict';

    // Canvas state
    let canvasOffset = { x: 0, y: 0 };
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartOffsetX = 0;
    let dragStartOffsetY = 0;
    let currentUserId = null;

    // Get current user ID
    function getUserId() {
        if (window.dashboard && window.dashboard.currentUser) {
            return window.dashboard.currentUser.id;
        }
        return null;
    }

    // Apply transform to container instead of individual tasks
    function applyTransform() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        const transformValue = `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0)`;

        // Use will-change hint for smoother animations
        container.style.willChange = 'transform';
        container.style.transform = transformValue;
    }

    // Update position indicator (throttled)
    let indicatorTimeout = null;

    function updateIndicator() {
        const indicator = document.getElementById('canvasPositionIndicator');
        const coords = document.getElementById('canvasCoords');

        if (indicator && coords) {
            coords.textContent = `X: ${Math.round(canvasOffset.x)}, Y: ${Math.round(canvasOffset.y)}`;
            indicator.classList.add('show');

            clearTimeout(indicatorTimeout);
            indicatorTimeout = setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    // Save position to localStorage
    function savePosition() {
        const userId = getUserId();
        if (!userId) return;

        const key = `taskflow-canvas-offset-${userId}`;
        localStorage.setItem(key, JSON.stringify(canvasOffset));
        console.log('Canvas saved:', canvasOffset);
    }

    // Load position from localStorage
    function loadPosition() {
        const userId = getUserId();
        if (!userId) return;

        const key = `taskflow-canvas-offset-${userId}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                canvasOffset = JSON.parse(saved);
                console.log('Canvas loaded:', canvasOffset);
                // Only apply if in fluid mode
                if (document.body.classList.contains('fluid-mode')) {
                    applyTransform();
                }
            } catch (e) {
                console.error('Error loading canvas:', e);
                canvasOffset = { x: 0, y: 0 };
            }
        }
    }

    // Mouse down handler
    function handleMouseDown(e) {
        const container = document.getElementById('tasksContainer');

        // Only drag if clicking on background
        if (e.target !== container &&
            !e.target.classList.contains('fluid-grid-overlay') &&
            !e.target.classList.contains('welcome-message')) {
            return;
        }

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartOffsetX = canvasOffset.x;
        dragStartOffsetY = canvasOffset.y;

        if (container) {
            container.style.cursor = 'grabbing';
            // Enable will-change when dragging starts
            container.style.willChange = 'transform';
        }

        e.preventDefault();
    }

    // Mouse move handler - direct updates with passive event optimization
    function handleMouseMove(e) {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        canvasOffset.x = dragStartOffsetX + deltaX;
        canvasOffset.y = dragStartOffsetY + deltaY;

        // Direct update - transforming ONE element is fast
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.style.transform = `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0)`;
        }

        updateIndicator();
    }

    // Mouse up handler
    function handleMouseUp() {
        if (!isDragging) return;

        isDragging = false;

        const container = document.getElementById('tasksContainer');
        if (container) {
            container.style.cursor = '';
            // Remove will-change after dragging to save memory
            setTimeout(() => {
                if (!isDragging) {
                    container.style.willChange = 'auto';
                }
            }, 300);
        }

        savePosition();
    }

    // Reset canvas to center
    function resetCanvas() {
        canvasOffset = { x: 0, y: 0 };
        applyTransform();
        savePosition();
        updateIndicator();

        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification('Canvas reset to center', 'info');
        }
    }

    // Enable canvas dragging
    function enableDragging() {
        const container = document.getElementById('tasksContainer');
        if (!container) {
            console.warn('Tasks container not found');
            return;
        }

        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        console.log('Canvas dragging enabled');
    }

    // Disable canvas dragging
    function disableDragging() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        container.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Reset container transform when exiting fluid mode
        canvasOffset = { x: 0, y: 0 };
        container.style.transform = '';
        container.style.willChange = '';

        console.log('Canvas dragging disabled');
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Canvas move initializing...');

        // Wait for dashboard to be ready
        setTimeout(function() {
            if (!window.dashboard) {
                console.warn('Dashboard not found');
                return;
            }

            currentUserId = getUserId();
            loadPosition();

            // Hook into fluid mode enter
            const originalEnter = window.dashboard.enterFluidMode;
            if (originalEnter) {
                window.dashboard.enterFluidMode = function() {
                    originalEnter.call(this);
                    setTimeout(enableDragging, 500);
                };
            }

            // Hook into fluid mode exit
            const originalExit = window.dashboard.exitFluidMode;
            if (originalExit) {
                window.dashboard.exitFluidMode = function() {
                    disableDragging();
                    originalExit.call(this);
                };
            }

            // Setup reset button
            const resetBtn = document.getElementById('resetCanvas');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetCanvas);
                console.log('Reset button connected');
            }

            // Add public methods to dashboard
            window.dashboard.canvasReset = resetCanvas;
            window.dashboard.canvasApplyTransform = applyTransform;

            console.log('Canvas move ready');
        }, 1000);
    });

})();