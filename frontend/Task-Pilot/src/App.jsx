import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/login"
import SignUp from "./pages/auth/signup"
import Dashboard from "./pages/admin/Dashboard"
import ManageTasks from "./pages/admin/ManageTask"
import ManageUsers from "./pages/admin/ManageUsers"
import CreateTask from "./pages/admin/CreateTask"
import PrivateRoute from "./routes/PrivateRoute"
import UserDashboard from "./pages/user/UserDashboard"
import TaskDetails from "./pages/user/TaskDetails"
import MyTasks from "./pages/user/MyTask"
import { useSelector } from "react-redux"
import { Toaster } from "react-hot-toast"

const Root = () => {
  const { currentUser } = useSelector((state) => state.user)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return currentUser.role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/user/dashboard" replace />
  )
}

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin", "user"]} />}>
            <Route path="/user/task-details/:id" element={<TaskDetails />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Root />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
    </div>
  )
}

export default App
