import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import TaskCard from "../../components/Cards/TaskCard";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";


/* ================= STATUS NORMALIZER ================= */
const normalizeStatus = (status) => {
  if (!status) return "";

  const value = status.toLowerCase();
  if (value.includes("progress")) return "In Progress";
  if (value.includes("complete")) return "Completed";
  if (value.includes("pending")) return "Pending";

  return status;
};

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_MY_TASKS);


      const rawTasks = response.data?.tasks || [];

      const tasks = rawTasks.map((task) => ({
        ...task,
        status: normalizeStatus(task.status),
      }));

      setAllTasks(tasks);

      setTabs([
        { label: "All", count: tasks.length },
        {
          label: "Pending",
          count: tasks.filter((t) => t.status === "Pending").length,
        },
        {
          label: "In Progress",
          count: tasks.filter((t) => t.status === "In Progress").length,
        },
        {
          label: "Completed",
          count: tasks.filter((t) => t.status === "Completed").length,
        },
      ]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getAllTasks(); // ✅ fetch ONCE
  }, []);

  const filteredTasks =
    filterStatus === "All"
      ? allTasks
      : allTasks.filter((task) => task.status === filterStatus);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-3 mt-4">
        <h2 className="text-lg font-semibold">My Tasks</h2>

        {/* TABS */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilterStatus(tab.label)}
              className={`relative flex items-center gap-2 text-sm font-medium pb-2 ${
                filterStatus === tab.label
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filterStatus === tab.label
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
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
              assignedTo={item.assignedTo?.map(
                (u) => u.profileImageUrl
              )}
              attachments={item.attachments || []}
              links={item.links || []}
              attachmentCount={
                (item.attachments?.length || 0) +
                (item.links?.length || 0)
              }
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() =>
                navigate(`/user/task-details/${item._id}`)
              }
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

export default MyTasks;
