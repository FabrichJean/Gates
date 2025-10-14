import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import VideoDetails from "../pages/VideoDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";
import Profil from "../pages/Profil";
import Register from "../pages/Register";
import InsideSidebar from "../components/InsideSidebar";
import Users from "../pages/Users";
import NotFound from "../pages/NotFound";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/login"
        element={
          <Login />
        } />
      <Route
        path="/register"
        element={
          <Register />
        } />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <Dashboard />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          // <ProtectedRoute>
          <InsideSidebar>
            <AdminDashboard />
          </InsideSidebar>
          // </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <Users />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          // <ProtectedRoute>
          <InsideSidebar>
            <Upload />
          </InsideSidebar>
          // </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <Profil />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <VideoDetails />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
