import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";

import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput';
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput';
import TaskCard from '../../components/Cards/TaskCard';
import Modal from '../../components/Modal';

const CreateTask = ({ activeMenu }) => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  //Create Task
  const CreateTask = async () => {
  setLoading(true);

  try {
    const todolist = taskData.todoChecklist?.map((item) => ({
      text: item,
      completed: false,
    }));

    const response = await axiosInstance.post(
      API_PATHS.TASKS.CREATE_TASK,
      {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      }
    );

    toast.success("Task Created Successfully");
    clearData();

  } catch (error) {
    console.log("Error creating Task:", error);
  } finally {
    setLoading(false);
  }
};
  
  //Update Task
  const updateTask = async () => {
  setLoading(true);

  try {
    const todolist = taskData.todoChecklist?.map((item) => {
      const prevTodoChecklist = currentTask?.todoChecklist || [];
      const matchedTask = prevTodoChecklist.find(
        (task) => task.text === item
      );

      return {
        text: item,
        completed: matchedTask ? matchedTask.completed : false,
      };
    });

    const response = await axiosInstance.put(
      API_PATHS.TASKS.UPDATE_TASK(taskId),
      {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      }
    );

    toast.success("Task Updated Successfully");
  } catch (error) {
    console.error("Error updating Task:", error);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async () => {
    setError(null);

    //Input Validation
    if(!taskData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Description is required");
      return;
    }

      if (!taskData.dueDate) {
        setError("Due Date is required")
        return;
      };

      if(taskData.assignedTo?.length === 0) {
        setError("Task not Assigned to any Member");
        return;
      }
      
      if (taskData.todoChecklist?.length === 0) {
        setError("Add atleast one todo task");
        return;
      }
    
      if (taskId) {
        updateTask();
        return;
      }

      CreateTask();
  };

// Get Task Details By Id
const getTaskDetailsByID = async () => {
try{
  const response = await axiosInstance.get(
    API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
  );

  if (response.data) {
    const taskInfo = response.data;
   // setCurrentTask(taskInfo);

    setTaskData((prevState) => ({
      title: taskInfo.title,
      description: taskInfo.description,
      priority:taskInfo.priority,
      dueDate: taskInfo.dueDate
        ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
        :null,
        assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
        todoChecklist:
        taskInfo?.todoChecklist?.map((item) => item?.text) || [],
        attachments: taskInfo?.attachments || [],
    }));
  }
} catch (error) {
  console.error("Error Fetching User",error ); 
}
};

// Delete Tasks
const deleteTask = async () => {
  try {
    await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

    setOpenDeleteAlert(false);
    toast.success("Expense details deleted successfully");
    navigate('/admin/tasks')
  } catch (error) {
    console.error(
      "Error deleting expense:",
      error.response?.data?.message || error.message
    );
  }
};

useEffect(() => {
  if(taskId){
    getTaskDetailsByID(taskId)
  }

  return () => {};
}, [taskId]);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" />
                  Delete
                </button>
              )}
            </div>

            {/* TITLE */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>
              <input
                placeholder="Create App UI"
                className="form-input"
                value={taskData.title}
                onChange={(e) =>
                  handleValueChange("title", e.target.value)
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={(e) =>
                  handleValueChange("description", e.target.value)
                }
              />
            </div>

            {/* GRID */}
            <div className="grid grid-cols-12 gap-4 mt-4">

              {/* PRIORITY */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>
                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) =>
                    handleValueChange("priority", value)
                  }
                  placeholder="Select Priority"
                />
              </div>

              {/* DUE DATE */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={(e) =>
                    handleValueChange("dueDate", e.target.value)
                  }
                />
              </div>

              {/* ASSIGN USERS */}
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>
                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) =>
                    handleValueChange("assignedTo", value)
                  }
                />
              </div>

              {/* TODO CHECKLIST */}
              <div className="col-span-12 mt-4">
                <label className="text-xs font-medium text-slate-600">
                  TODO Checklist
                </label>
                <TodoListInput
                  todoList={taskData.todoChecklist}
                  setTodoList={(value) =>
                    handleValueChange("todoChecklist", value)
                  }
                />
              </div>

              {/* ATTACHMENTS */}
              <div className="col-span-12 mt-4">
                <label className="text-xs font-medium text-slate-600">
                  Add Attachments
                </label>
                <AddAttachmentsInput
                  attachments={taskData.attachments}
                  setAttachments={(value) =>
                    handleValueChange("attachments", value)
                  }
                />
              </div>
            </div>

                {error && (
                  <p className='text-xs font-medium text-red-500 mt-5'>{error}</p>
                )}

            <div className='flex justify-end mt-7'>
              <button
              className='add-btn cursor-pointer'
              onClick={handleSubmit}
              disabled={loading}
              >
                {taskId ? "UPDATE TASK" : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    
    <Modal
  isOpen={openDeleteAlert}
  onClose={() => setOpenDeleteAlert(false)}
  title="Delete Task"
>
  <p className="text-sm text-slate-600">
    Are you sure you want to delete this task?
  </p>

  <div className="flex justify-end gap-3 mt-6">
    <button
      className="px-3 py-1.5 text-sm border rounded"
      onClick={() => setOpenDeleteAlert(false)}
    >
      Cancel
    </button>

    <button
      className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded"
      onClick={deleteTask}
    >
      Delete
    </button>
  </div>
</Modal>

    </DashboardLayout>
  );
};

export default CreateTask;
