const Task = require("../models/Task");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// EXPORT TASKS
const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 40 },
    ];

    tasks.forEach((task) => {
      const assignedTo =
        task.assignedTo?.map((u) => `${u.name} (${u.email})`).join(", ") ||
        "Unassigned";

      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        assignedTo,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: "Error Exporting Tasks",
      error: error.message,
    });
  }
};


// EXPORT USERS (with task summary)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email").lean();
    const tasks = await Task.find().populate("assignedTo", "name email");

    // Build user task map
    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    tasks.forEach((task) => {
      task.assignedTo?.forEach((user) => {
        const mapEntry = userTaskMap[user._id];
        if (!mapEntry) return;

        mapEntry.totalTasks += 1;

        if (task.status === "Pending") mapEntry.pendingTasks += 1;
        else if (task.status === "InProgress" || task.status === "In Progress")
          mapEntry.inProgressTasks += 1;
        else if (task.status === "Completed") mapEntry.completedTasks += 1;
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Total Tasks", key: "totalTasks", width: 15 },
      { header: "Pending Tasks", key: "pendingTasks", width: 15 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 15 },
      { header: "Completed Tasks", key: "completedTasks", width: 15 },
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error Exporting Users", error: error.message });
  }
};

module.exports = { exportTasksReport, exportUsersReport };
