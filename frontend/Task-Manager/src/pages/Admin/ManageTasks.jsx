import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuFileSpreadsheet } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import TaskCard from "../../components/Cards/TaskCard";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

/* ================= STATUS NORMALIZER ================= */
const normalizeStatus = (status) => {
  if (!status) return "";

  const value = status.toLowerCase();

  if (value.includes("progress")) return "In Progress";
  if (value.includes("complete")) return "Completed";
  if (value.includes("pending")) return "Pending";

  return status;
};

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_ALL_TASKS
      );

      /* ===== GET TASKS FROM ANY RESPONSE SHAPE ===== */
      const rawTasks =
        response.data?.tasks ||
        response.data?.data?.tasks ||
        response.data?.result?.tasks ||
        [];

      /* ===== NORMALIZE STATUS ===== */
      const tasks = rawTasks.map((task) => ({
        ...task,
        status: normalizeStatus(task.status),
      }));

      setAllTasks(tasks);

      /* ===== CALCULATE COUNTS FROM FRONTEND (SAFE) ===== */
      const statusCount = {
        All: tasks.length,
        Pending: tasks.filter((t) => t.status === "Pending").length,
        "In Progress": tasks.filter((t) => t.status === "In Progress").length,
        Completed: tasks.filter((t) => t.status === "Completed").length,
      };

      setTabs([
        { label: "All", count: statusCount.All },
        { label: "Pending", count: statusCount.Pending },
        { label: "In Progress", count: statusCount["In Progress"] },
        { label: "Completed", count: statusCount.Completed },
      ]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskClick = (task) => {
    navigate("/admin/create-task", {
      state: { taskId: task._id },
    });
  };

  const handleDownloadReport = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.REPORTS.EXPORT_TASKS,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "task_details.xlsx");

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error Downloading expense details", error);
    toast.error("Failed to Download Expenses Details. Please try again");
  }
};


  useEffect(() => {
    getAllTasks();
  }, []);

  /* ===== FILTER TASKS BASED ON TAB ===== */
  const filteredTasks =
    filterStatus === "All"
      ? allTasks
      : allTasks.filter((task) => task.status === filterStatus);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-3 mt-4">
        <h2 className="text-lg font-semibold">My Task</h2>

        {/* TABS */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilterStatus(tab.label)}
              className={`relative flex items-center gap-2 text-sm font-medium pb-2
                ${
                  filterStatus === tab.label
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <span>{tab.label}</span>

              <span
                className={`text-xs px-2 py-0.5 rounded-full
                  ${
                    filterStatus === tab.label
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {tab.count}
              </span>

              {filterStatus === tab.label && (
                <span className="absolute left-0 -bottom-[13px] h-[2px] w-full bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                     bg-lime-100 text-lime-700 rounded-md hover:bg-lime-200"
        >
          <LuFileSpreadsheet className="text-base" />
          Download Report
        </button>
      </div>

      {/* TASK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((item) => (
            <TaskCard
  key={item._id}
  title={item.title}
  description={item.description}
  priority={item.priority}
  status={item.status}
  createdAt={item.createdAt}
  dueDate={item.dueDate}
  assignedTo={item.assignedTo?.map(u => u.profileImageUrl)}

  // Pass full arrays for modal
  attachments={item.attachments || []}
  links={item.links || []}

  attachmentCount={
    (item.attachments?.length || 0) +
    (item.links?.length || 0)
  }

  completedTodoCount={item.completedTodoCount || 0}
  todoChecklist={item.todoChecklist || []}
  onClick={() => handleTaskClick(item)}
/>

          ))
        ) : (
          <p className="text-sm text-gray-500">
            No tasks available for this status
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
