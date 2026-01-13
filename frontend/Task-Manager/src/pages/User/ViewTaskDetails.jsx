import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import AvatarGroup from "../../components/AvatarGroup";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  /* ---------------- STATUS COLOR ---------------- */
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-lime-600 bg-lime-50 border border-lime-200";
      case "InProgress":
        return "text-cyan-600 bg-cyan-50 border border-cyan-200";
      default:
        return "text-violet-600 bg-violet-50 border border-violet-200";
    }
  };

  /* ---------------- FETCH TASK ---------------- */
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );
      if (response?.data) setTask(response.data);
    } catch (error) {
      console.error("Error fetching task", error);
    }
  };

  /* ---------------- TODO CHECK/UNCHECK ---------------- */
  const updateTodoChecklisk = async (index) => {
    const todoChecklist = [...(task?.todoChecklist || [])];
    const taskId = id;

  if(todoChecklist &&  todoChecklist[index]) {
    todoChecklist[index].completed = !todoChecklist[index].completed;

    try {
        const response = await axiosInstance.put(
            API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
            { todoChecklist }
        );

        if (response.status === 200) {
            setTask(response.data?.task || task);
        } else {
            //Optionsally revert the toggle if the API call First
            todoChecklist[index].completed = !todoChecklist[index].completed;
            }
        } catch (error) {
            todoChecklist[index].completed = !todoChecklist[index].completed;
        }
    }
};


  /* ---------------- ATTACHMENT CLICK ---------------- */
  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }
    window.open(link, "_blank");
  };

  useEffect(() => {
    if (id) getTaskDetailsByID();
  }, [id]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-6 max-w-5xl">
        {!task && <p className="text-sm text-gray-500">Loading task details...</p>}

        {task && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            {/* HEADER */}
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-800 leading-relaxed">{task.description || "—"}</p>
            </div>

            {/* META INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <InfoBox label="Priority" value={task.priority || "—"} />

              <InfoBox
                label="Due Date"
                value={task.dueDate ? moment(task.dueDate).format("Do MMM YYYY") : "N/A"}
              />

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Assigned To</p>
                <AvatarGroup
                  avatars={task.assignedTo?.map((item) => item?.profileImageUrl) || []}
                  maxVisible={5}
                />
              </div>
            </div>

            {/* TODO CHECKLIST */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-3">Todo Checklist</p>

              {task.todoChecklist?.length === 0 && (
                <p className="text-sm text-gray-400">No todos added</p>
              )}

              <div className="space-y-2">
                {task.todoChecklist?.map((item, index) => (
                  <TodoChecklist
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item.completed} // ✅ correct
                    onChange={() => updateTodoChecklisk(index)}
                    />
                ))}
              </div>
            </div>

            {/* ATTACHMENTS */}
            {task.attachments?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>

                {task.attachments.map((link, index) => (
                  <Attachments
                    key={`link_${index}`}
                    link={link}
                    index={index}
                    onClick={() => handleLinkClick(link)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

/* ---------------- COMPONENTS ---------------- */

const InfoBox = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-gray-800">{value}</p>
  </div>
);

const TodoChecklist = ({ text, isChecked, onChange }) => (
  <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 accent-blue-600 cursor-pointer"
    />
    <p className="text-sm text-gray-800">{text}</p>
  </div>
);


const Attachments = ({ link, index, onClick }) => (
  <div
    className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-2 cursor-pointer hover:bg-gray-100"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 font-semibold">{index < 9 ? `0${index + 1}` : index + 1}</span>
      <p className="text-xs text-gray-800 truncate max-w-[240px]">{link}</p>
    </div>
    <LuSquareArrowOutUpRight className="text-gray-400" />
  </div>
);
