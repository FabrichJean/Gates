import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import VideoDetails from "../pages/VideoDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import Profil from "../pages/Profil";
import Register from "../pages/Register";
import InsideSidebar from "../components/InsideSidebar";
import VideosManagment from "../pages/VideosManagment";

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
              {/* <Dashboard /> */}
               <VideosManagment />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          // <ProtectedRoute>
          <InsideSidebar>
            <VideosManagment />
          </InsideSidebar>
          // </ProtectedRoute>
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
          // <ProtectedRoute>
          <Profil />
          // </ProtectedRoute>
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
