import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PrivateRoute from "./routes/PrivateRoute";

import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTask";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

import UserProvider, { UserContext } from "./context/userContext";


// ================= APP =================
const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>

      <Toaster toastOptions={{ style: { fontSize: "13px" } }} />
    </UserProvider>
  );
};

export default App;


// ================= ROUTES =================
const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Root */}
      <Route path="/" element={<Root />} />

      {/* Admin */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/tasks" element={<ManageTasks />} />
        <Route path="/admin/create-task" element={<CreateTask />} />
        <Route path="/admin/users" element={<ManageUsers />} />
      </Route>

      {/* User */}
      <Route element={<PrivateRoute allowedRoles={["user"]} />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/tasks" element={<MyTasks />} />
        <Route
          path="/user/task-details/:id"
          element={<ViewTaskDetails />}
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
};


// ================= ROOT REDIRECT =================
const Root = () => {
  const { user, loading } = useContext(UserContext);

  console.log("User:", user);
  console.log("Loading:", loading);

  // ✅ Show loader instead of blank screen
  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px",
        fontWeight: "500"
      }}>
        Loading...
      </div>
    );
  }

  // ✅ If no user → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role-based redirect
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};
