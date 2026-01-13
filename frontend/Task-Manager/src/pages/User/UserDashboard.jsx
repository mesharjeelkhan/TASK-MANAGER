import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { LuArrowRight } from "react-icons/lu";

import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";

import InfoCard from "../../components/Cards/InfoCard";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";


const COLORS = ["#8D51FF", "#00B8DF", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [inProgressTasks, setInProgressTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Use correct API based on role
        const apiUrl =
          user?.role === "admin"
            ? API_PATHS.TASKS.GET_DASHBOARD_DATA
            : API_PATHS.TASKS.GET_USER_DASHBOARD_DATA;

        const res = await axiosInstance.get(apiUrl);
        const data = res?.data || {};
        setDashboardData(data);

        // ====== For normal user ======
        if (user?.role !== "admin") {
          const taskDistribution = data?.charts?.taskDistribution || {};
          const priorityLevels = data?.charts?.taskPriorityLevels || {};

          const pending = taskDistribution["Pending"] || 0;
          const inProgress =
            taskDistribution["In Progress"] ?? taskDistribution["InProgress"] ?? 0;
          const completed = taskDistribution["Completed"] || 0;
          const total = pending + inProgress + completed;

          setPendingTasks(pending);
          setInProgressTasks(inProgress);
          setCompletedTasks(completed);
          setTotalTasks(total);

          setPieChartData([
            { name: "Pending", value: pending },
            { name: "In Progress", value: inProgress },
            { name: "Completed", value: completed },
          ]);

          setBarChartData([
            { name: "Low", value: priorityLevels.Low || 0 },
            { name: "Medium", value: priorityLevels.Medium || 0 },
            { name: "High", value: priorityLevels.High || 0 },
          ]);
        } else {
          // ====== For admin ======
          const stats = data?.statistics || {};
          setTotalTasks(stats.totalTasks || 0);
          setPendingTasks(stats.pendingTasks || 0);
          setInProgressTasks(stats.inProgressTasks || 0);
          setCompletedTasks(stats.completedTasks || 0);

          // Optional: pie and bar chart for admin
          setPieChartData([
            { name: "Pending", value: stats.pendingTasks || 0 },
            { name: "In Progress", value: stats.inProgressTasks || 0 },
            { name: "Completed", value: stats.completedTasks || 0 },
          ]);

          setBarChartData([
            { name: "Low", value: data.taskPriorityLevels?.Low || 0 },
            { name: "Medium", value: data.taskPriorityLevels?.Medium || 0 },
            { name: "High", value: data.taskPriorityLevels?.High || 0 },
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="p-6 text-center text-gray-400">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl">
            Good Morning! {user?.name}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {moment().format("dddd Do MMM YYYY")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(totalTasks)}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(pendingTasks)}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(inProgressTasks)}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(completedTasks)}
            color="bg-lime-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h5 className="font-medium mb-2">Task Distribution</h5>
            <div className="h-[350px]">
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Task Priority Levels</h5>
            <div className="h-[350px]">
              <CustomBarChart data={barChartData} colors={COLORS} />
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg">Recent Tasks</h5>
          <button
            className="card-btn"
            onClick={() => navigate("/admin/tasks")}
          >
            See All <LuArrowRight />
          </button>
        </div>

        <TaskListTable
          tableData={dashboardData?.recentTasks || []}
        />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
