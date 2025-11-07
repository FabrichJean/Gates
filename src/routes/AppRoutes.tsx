import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Upload from "../pages/Upload";
import VideoDetails from "../pages/VideoDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import Profil from "../pages/Profil";
import Register from "../pages/Register";
import InsideSidebar from "../components/InsideSidebar";
import VideosManagment from "../pages/VideosManagment";
import Users from "../pages/Users";
import NotFound from "../pages/NotFound";
import Settings from "../pages/Settings";
import UsersArchives from "../pages/UsersArchive";
import CreateUser from "../pages/CreateUser";
import SuperProtected from "../components/SuperProtected";
import TouchVideo from "../pages/TouchVideo";
import Conversion from "../pages/Convertion";
import CategoryManager from "../pages/CategoryManager";
import Plateform from "../pages/Plateform";

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
              <VideosManagment />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <Users />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <VideosManagment />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/upload"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <Upload />
            </InsideSidebar>
          </ProtectedRoute>
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
        path="/users/create"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <CreateUser />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:1"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <Profil />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/archive"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <UsersArchives />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/category-manager"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <CategoryManager />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plateform"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <Plateform />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversion"
        element={
          <ProtectedRoute>
            {/* <SuperProtected> */}
              <InsideSidebar>
                <Conversion />
              </InsideSidebar>
            {/* </SuperProtected> */}
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {/* <SuperProtected> */}
              <InsideSidebar>
                <Settings />
              </InsideSidebar>
            {/* </SuperProtected> */}
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
      <Route
        path="/touch/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <TouchVideo />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
