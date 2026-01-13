const Task = require("../models/Task");

/* ========================= GET TASKS ========================= */

const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status) filter.status = status;

        let tasks;

        if (req.user.role === "admin") {
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        } else {
            tasks = await Task.find({
                ...filter,
                assignedTo: req.user._id,
            }).populate("assignedTo", "name email profileImageUrl");
        }

        tasks = tasks.map(task => {
            const completedCount =
                task.todoChecklist?.filter(item => item.completed).length || 0;
            return { ...task._doc, completedTodoCount: completedCount };
        });

        const baseFilter =
            req.user.role === "admin" ? {} : { assignedTo: req.user._id };

        const allTasks = await Task.countDocuments(baseFilter);
        const pendingTasks = await Task.countDocuments({
            ...baseFilter,
            status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
            ...baseFilter,
            status: "InProgress",
        });
        const completedTasks = await Task.countDocuments({
            ...baseFilter,
            status: "Completed",
        });

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= GET TASK BY ID ========================= */

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) return res.status(404).json({ message: "Task Not Found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= CREATE TASK ========================= */

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res
                .status(400)
                .json({ message: "assignedTo must be an array of user IDs" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
        });

        res.status(201).json({ message: "Task Created Successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= UPDATE TASK ========================= */

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not Found" });

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res
                    .status(400)
                    .json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= DELETE TASK ========================= */

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not Found" });

        await task.deleteOne();
        res.json({ message: "Task deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= UPDATE TASK STATUS ========================= */

const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task Not Found" });

        const isAssigned = task.assignedTo.some(
            id => id.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not Authorized" });
        }

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach(item => (item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({ message: "Task Status Updated" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= UPDATE TASK CHECKLIST ========================= */

const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;

        if (!Array.isArray(todoChecklist)) {
            return res.status(400).json({ message: "Invalid checklist data" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task Not Found" });

        const isAssigned = task.assignedTo.some(
            id => id.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not Authorized to Update checklist" });
        }

        task.todoChecklist = todoChecklist;

        const completedCount = todoChecklist.filter(
            item => item.completed
        ).length;
        const totalItems = todoChecklist.length;

        task.progress =
            totalItems > 0
                ? Math.round((completedCount / totalItems) * 100)
                : 0;

        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "InProgress";
        } else {
            task.status = "Pending";
        }

        await task.save();

        const updatedTask = await Task.findById(task._id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({ message: "Task checklist updated", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= DASHBOARD (ADMIN) ========================= */

const getDashboardData = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "Pending" });
        const completedTasks = await Task.countDocuments({ status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        const taskStatuses = ["Pending", "InProgress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const key = status.replace(/\s+/g, "");
            acc[key] =
                taskDistributionRaw.find(item => item._id === status)?.count ||
                0;
            return acc;
        }, {});
        taskDistribution.All = totalTasks;

        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find(
                    item => item._id === priority
                )?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= DASHBOARD (USER) ========================= */

const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "Pending",
        });
        const completedTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "Completed",
        });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        const taskStatuses = ["Pending", "InProgress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const key = status.replace(/\s+/g, "");
            acc[key] =
                taskDistributionRaw.find(item => item._id === status)?.count ||
                0;
            return acc;
        }, {});
        taskDistribution.All = totalTasks;

        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find(
                    item => item._id === priority
                )?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ========================= EXPORTS ========================= */

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
};
