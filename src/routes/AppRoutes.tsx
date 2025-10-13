import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import VideoDetails from "../pages/VideoDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/login"
        element={
          <Login />
        } />
      <Route
        path="/"
        element={
          // <ProtectedRoute>
            <Dashboard />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          // <ProtectedRoute>
            <AdminDashboard />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          // <ProtectedRoute>
          <Upload />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/videos/:id"
        element={
          <ProtectedRoute>
            <VideoDetails />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
