// servertasks.js - All task and subtask related routes
// This file handles all /api/tasks and /api/subtasks endpoints

module.exports = function(app, db, authenticateUser) {


    // Get all tasks for user
    app.get('/api/tasks', authenticateUser, (req, res) => {
        console.log('\nGETTING TASKS for user:', req.user.id);

        db.all(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id],
            (err, tasks) => {
                if (err) {
                    console.error('Error fetching tasks:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch tasks'
                    });
                }

                console.log(`Found ${tasks.length} tasks`);
                res.json({
                    success: true,
                    tasks: tasks
                });
            }
        );
    });

    // Create new task
    app.post('/api/tasks', authenticateUser, (req, res) => {
        console.log('\nCREATING TASK for user:', req.user.id);

        const { title, description, priority, dueDate, type } = req.body;

        if (!title || title.trim().length === 0) {
            console.log('Missing task title');
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        if (!['low', 'medium', 'high'].includes(priority)) {
            console.log('Invalid priority:', priority);
            return res.status(400).json({
                success: false,
                message: 'Invalid priority level'
            });
        }

        if (!['individual', 'group'].includes(type)) {
            console.log('Invalid task type:', type);
            return res.status(400).json({
                success: false,
                message: 'Invalid task type'
            });
        }

        console.log('Task data:', {
            title: title.trim(),
            description: description ? description.trim() : null,
            priority,
            dueDate: dueDate || null,
            type
        });

        db.run(
            `INSERT INTO tasks (user_id, title, description, priority, due_date, type, completed, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                req.user.id,
                title.trim(),
                description ? description.trim() : null,
                priority,
                dueDate || null,
                type,
                false
            ],
            function(err) {
                if (err) {
                    console.error('Task creation failed:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create task'
                    });
                }

                const taskId = this.lastID;
                console.log(`Task created with ID: ${taskId}`);

                // Fetch the created task to return it
                db.get(
                    'SELECT * FROM tasks WHERE id = ?',
                    [taskId],
                    (err, task) => {
                        if (err) {
                            console.error('Error fetching created task:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Task created but failed to fetch'
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: 'Task created successfully',
                            task: task
                        });
                    }
                );
            }
        );
    });

    // Update task - WITH COLOR SUPPORT FIXED
    app.put('/api/tasks/:id', authenticateUser, (req, res) => {
        console.log('\nUPDATING TASK:', req.params.id, 'for user:', req.user.id);

        const taskId = parseInt(req.params.id);
        const { title, description, priority, dueDate, type, completed, color, colorData } = req.body;

        //verify task belongs to user
        db.get(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, req.user.id],
            (err, task) => {
                if (err) {
                    console.error('Error checking task ownership:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!task) {
                    console.log('Task not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                }

                // Build update query dynamically based on provided fields
                const updates = [];
                const values = [];

                if (title !== undefined) {
                    updates.push('title = ?');
                    values.push(title.trim());
                }
                if (description !== undefined) {
                    updates.push('description = ?');
                    values.push(description ? description.trim() : null);
                }
                if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
                    updates.push('priority = ?');
                    values.push(priority);
                }
                if (dueDate !== undefined) {
                    updates.push('due_date = ?');
                    values.push(dueDate || null);
                }
                if (type !== undefined && ['individual', 'group'].includes(type)) {
                    updates.push('type = ?');
                    values.push(type);
                }
                if (completed !== undefined) {
                    updates.push('completed = ?');
                    values.push(completed ? 1 : 0);
                }
                // COLOR SUPPORT - FIXED PLACEMENT
                if (color !== undefined) {
                    updates.push('color = ?');
                    values.push(color);
                    console.log('Updating task color to:', color);
                }
                if (colorData !== undefined) {
                    updates.push('color_data = ?');
                    values.push(colorData);
                }

                if (updates.length === 0) {
                    console.log('No valid fields to update');
                    return res.status(400).json({
                        success: false,
                        message: 'No valid fields to update'
                    });
                }

                values.push(taskId);

                const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

                db.run(query, values, function(err) {
                    if (err) {
                        console.error('Task update failed:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update task'
                        });
                    }

                    console.log('Task updated successfully');

                    // Return updated task
                    db.get(
                        'SELECT * FROM tasks WHERE id = ?',
                        [taskId],
                        (err, updatedTask) => {
                            if (err) {
                                console.error('Error fetching updated task:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Task updated but failed to fetch'
                                });
                            }

                            res.json({
                                success: true,
                                message: 'Task updated successfully',
                                task: updatedTask
                            });
                        }
                    );
                });
            }
        );
    });

    // Delete task
    app.delete('/api/tasks/:id', authenticateUser, (req, res) => {
        console.log('\nDELETING TASK:', req.params.id, 'for user:', req.user.id);

        const taskId = parseInt(req.params.id);

        // Verify task belongs to user and delete
        db.run(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, req.user.id],
            function(err) {
                if (err) {
                    console.error('Task deletion failed:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete task'
                    });
                }

                if (this.changes === 0) {
                    console.log('Task not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Task not found'
                    });
                }

                console.log('Task deleted successfully');
                res.json({
                    success: true,
                    message: 'Task deleted successfully'
                });
            }
        );
    });

    // ====== SUBTASK ROUTES ======

    // Get subtasks for a specific group task
    app.get('/api/tasks/:taskId/subtasks', authenticateUser, (req, res) => {
        console.log('\nGETTING SUBTASKS for task:', req.params.taskId, 'user:', req.user.id);

        const taskId = parseInt(req.params.taskId);

        // First verify the parent task belongs to the user
        db.get(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ? AND type = \'group\'',
            [taskId, req.user.id],
            (err, task) => {
                if (err) {
                    console.error('Error checking task ownership:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!task) {
                    console.log('Group task not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Group task not found'
                    });
                }

                // Get subtasks for this group task
                db.all(
                    'SELECT * FROM subtasks WHERE parent_task_id = ? ORDER BY created_at ASC',
                    [taskId],
                    (err, subtasks) => {
                        if (err) {
                            console.error('Error fetching subtasks:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to fetch subtasks'
                            });
                        }

                        console.log(`Found ${subtasks.length} subtasks for task ${taskId}`);
                        res.json({
                            success: true,
                            subtasks: subtasks
                        });
                    }
                );
            }
        );
    });

    // Create new subtask
    app.post('/api/subtasks', authenticateUser, (req, res) => {
        console.log('\nCREATING SUBTASK for user:', req.user.id);

        const { parentTaskId, title } = req.body;

        if (!title || title.trim().length === 0) {
            console.log('Missing subtask title');
            return res.status(400).json({
                success: false,
                message: 'Subtask title is required'
            });
        }

        if (!parentTaskId) {
            console.log('Missing parent task ID');
            return res.status(400).json({
                success: false,
                message: 'Parent task ID is required'
            });
        }

        // Verify parent task exists and belongs to user
        db.get(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ? AND type = \'group\'',
            [parentTaskId, req.user.id],
            (err, parentTask) => {
                if (err) {
                    console.error('Error checking parent task:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!parentTask) {
                    console.log('Parent group task not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Parent group task not found'
                    });
                }

                console.log('Subtask data:', {
                    title: title.trim(),
                    parentTaskId: parentTaskId
                });

                // Create subtask
                db.run(
                    `INSERT INTO subtasks (parent_task_id, title, completed, created_at)
                     VALUES (?, ?, ?, datetime('now'))`,
                    [
                        parentTaskId,
                        title.trim(),
                        false
                    ],
                    function(err) {
                        if (err) {
                            console.error('Subtask creation failed:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to create subtask'
                            });
                        }

                        const subtaskId = this.lastID;
                        console.log(`Subtask created with ID: ${subtaskId}`);

                        // Fetch the created subtask to return it
                        db.get(
                            'SELECT * FROM subtasks WHERE id = ?',
                            [subtaskId],
                            (err, subtask) => {
                                if (err) {
                                    console.error('Error fetching created subtask:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Subtask created but failed to fetch'
                                    });
                                }

                                res.status(201).json({
                                    success: true,
                                    message: 'Subtask created successfully',
                                    subtask: subtask
                                });
                            }
                        );
                    }
                );
            }
        );
    });

    // Update subtask - NO COLOR SUPPORT (subtasks don't have colors)
    app.put('/api/subtasks/:id', authenticateUser, (req, res) => {
        console.log('\nUPDATING SUBTASK:', req.params.id, 'for user:', req.user.id);

        const subtaskId = parseInt(req.params.id);
        const { title, completed } = req.body;

        //verify subtask belongs to user
        db.get(
            `SELECT s.*, t.user_id
             FROM subtasks s
             JOIN tasks t ON s.parent_task_id = t.id
             WHERE s.id = ? AND t.user_id = ?`,
            [subtaskId, req.user.id],
            (err, subtask) => {
                if (err) {
                    console.error('Error checking subtask ownership:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!subtask) {
                    console.log('Subtask not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Subtask not found'
                    });
                }

                // Build update query dynamically
                const updates = [];
                const values = [];

                if (title !== undefined) {
                    updates.push('title = ?');
                    values.push(title.trim());
                }
                if (completed !== undefined) {
                    updates.push('completed = ?');
                    values.push(completed ? 1 : 0);
                }

                if (updates.length === 0) {
                    console.log('No valid fields to update');
                    return res.status(400).json({
                        success: false,
                        message: 'No valid fields to update'
                    });
                }

                values.push(subtaskId);

                const query = `UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?`;

                db.run(query, values, function(err) {
                    if (err) {
                        console.error('Subtask update failed:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update subtask'
                        });
                    }

                    console.log('Subtask updated successfully');

                    // Return updated subtask
                    db.get(
                        'SELECT * FROM subtasks WHERE id = ?',
                        [subtaskId],
                        (err, updatedSubtask) => {
                            if (err) {
                                console.error('Error fetching updated subtask:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Subtask updated but failed to fetch'
                                });
                            }

                            res.json({
                                success: true,
                                message: 'Subtask updated successfully',
                                subtask: updatedSubtask
                            });
                        }
                    );
                });
            }
        );
    });

    // Toggle subtask completion
    app.put('/api/subtasks/:id/toggle', authenticateUser, (req, res) => {
        console.log('\nTOGGLING SUBTASK:', req.params.id, 'for user:', req.user.id);

        const subtaskId = parseInt(req.params.id);

        //verify subtask belongs to user and get current state
        db.get(
            `SELECT s.*, t.user_id
             FROM subtasks s
             JOIN tasks t ON s.parent_task_id = t.id
             WHERE s.id = ? AND t.user_id = ?`,
            [subtaskId, req.user.id],
            (err, subtask) => {
                if (err) {
                    console.error('Error checking subtask ownership:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!subtask) {
                    console.log('Subtask not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Subtask not found'
                    });
                }

                const newCompletedState = subtask.completed ? 0 : 1;

                db.run(
                    'UPDATE subtasks SET completed = ? WHERE id = ?',
                    [newCompletedState, subtaskId],
                    function(err) {
                        if (err) {
                            console.error('Subtask toggle failed:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to toggle subtask'
                            });
                        }

                        console.log('Subtask toggled successfully');

                        res.json({
                            success: true,
                            message: 'Subtask toggled successfully',
                            completed: newCompletedState === 1
                        });
                    }
                );
            }
        );
    });

    // Delete subtask
    app.delete('/api/subtasks/:id', authenticateUser, (req, res) => {
        console.log('\nDELETING SUBTASK:', req.params.id, 'for user:', req.user.id);

        const subtaskId = parseInt(req.params.id);

        // Verify subtask belongs to user and delete
        db.run(
            `DELETE FROM subtasks
             WHERE id = ? AND parent_task_id IN (
                 SELECT id FROM tasks WHERE user_id = ?
             )`,
            [subtaskId, req.user.id],
            function(err) {
                if (err) {
                    console.error('Subtask deletion failed:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete subtask'
                    });
                }

                if (this.changes === 0) {
                    console.log('Subtask not found or not owned by user');
                    return res.status(404).json({
                        success: false,
                        message: 'Subtask not found'
                    });
                }

                console.log('Subtask deleted successfully');
                res.json({
                    success: true,
                    message: 'Subtask deleted successfully'
                });
            }
        );
    });

};