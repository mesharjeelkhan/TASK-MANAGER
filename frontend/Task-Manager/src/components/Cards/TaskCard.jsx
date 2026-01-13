import React, { useState } from "react";
import moment from "moment";
import { LuPaperclip, LuX } from "react-icons/lu";

const TaskCard = ({
  title,
  description,
  priority,
  status,
  createdAt,
  dueDate,
  assignedTo = [],
  attachments = [],
  links = [],
  attachmentCount = 0,
  completedTodoCount = 0,
  todoChecklist = [],
  onClick,
}) => {
  const [showModal, setShowModal] = useState(false);

  /* ================= COLORS ================= */

  const getStatusColor = () => {
    switch (status) {
      case "Completed":
        return "bg-lime-100 text-lime-700";
      case "In Progress":
        return "bg-violet-100 text-violet-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "Low":
        return "bg-emerald-100 text-emerald-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-rose-100 text-rose-700";
    }
  };

  /* ================= PROGRESS ================= */

  const totalTodos = todoChecklist.length;
  const calculatedProgress =
    status === "Completed"
      ? 100
      : totalTodos > 0
      ? Math.round((completedTodoCount / totalTodos) * 100)
      : 0;

  /* ================= RENDER ================= */

  return (
    <>
      {/* CARD */}
      <div
        onClick={onClick}
        className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition cursor-pointer"
      >
        {/* BADGES */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {status}
          </span>

          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor()}`}>
            {priority} Priority
          </span>
        </div>

        <h3 className="font-semibold text-sm mb-1">{title}</h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {description}
        </p>

        <p className="text-xs font-medium mb-2">
          {status === "Completed"
            ? "Task Done: 100%"
            : totalTodos > 0
            ? `Task Done: ${completedTodoCount} / ${totalTodos}`
            : "Task Done: 0%"}
        </p>

        {/* PROGRESS */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div
            className={`h-1.5 rounded-full ${
              status === "Completed" ? "bg-lime-500" : "bg-indigo-500"
            }`}
            style={{ width: `${calculatedProgress}%` }}
          />
        </div>

        {/* DATES */}
        <div className="flex justify-between text-xs mb-4">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium">{moment(createdAt).format("Do MMM YYYY")}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{moment(dueDate).format("Do MMM YYYY")}</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {assignedTo.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                alt="user"
                className="w-7 h-7 rounded-full border-2 border-white"
              />
            ))}
          </div>

          {/* ATTACHMENT CLICK */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
          >
            <LuPaperclip />
            {attachmentCount}
          </button>
        </div>
      </div>

      {/* ATTACHMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">
                Attachments ({attachments.length + links.length})
              </h3>
              <button onClick={() => setShowModal(false)}>
                <LuX />
              </button>
            </div>

            {/* FILES */}
            {attachments.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-1">Files</p>
                <ul className="space-y-1 mb-3">
                  {attachments.map((file, i) => (
                    <li key={i} className="text-sm text-blue-600 underline">
                      <a href={file.fileUrl} target="_blank" rel="noreferrer">
                        {file.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* LINKS */}
            {links.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-1">Links</p>
                <ul className="space-y-1">
                  {links.map((link, i) => (
                    <li key={i} className="text-sm text-blue-600 underline">
                      <a href={link} target="_blank" rel="noreferrer">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {attachments.length === 0 && links.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No attachments available
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
