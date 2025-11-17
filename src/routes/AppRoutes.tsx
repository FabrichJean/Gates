import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VideosProvider } from "../context/VideosContext";
import { BotVideosProvider } from "../context/BotVideosContext";
import Login from "../pages/Login";
import Upload from "../pages/Upload";
import VideoDetails from "../pages/VideoDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import Profil from "../pages/Profil";
import Register from "../pages/Register";
import InsideSidebar from "../components/InsideSidebar";
import VideosManagment from "../pages/VideosManagment";
import VideoBotManagement from "../pages/VideoBotManagement";
import VideoBotDetails from "../pages/VideoBotDetails";
import Users from "../pages/Users";
import NotFound from "../pages/NotFound";
import Settings from "../pages/Settings";
import UsersArchives from "../pages/UsersArchive";
import CreateUser from "../pages/CreateUser";
import SuperProtected from "../components/SuperProtected";
import TouchVideo from "../pages/TouchVideo";
import TouchPost from "../pages/TouchPost";
import Conversion from "../pages/Convertion";
import CategoryManager from "../pages/CategoryManager";
import Plateform from "../pages/Plateform";
import PlateformSubCategoryManager from "../pages/PlateformSubCategoryManager";
import PlateformCategoryManager from "../pages/PlateformCategoryManager";
import PlateformRelationsManager from "../pages/PlateformRelationsManager";
import PostCategoryManager from "../pages/PostCategoryManager";
import CreatorManager from "../pages/CreatorManager";
import PostManagement from "../pages/PostManagement";
import UploadPost from "../pages/UploadPost";
import PostDetails from "../pages/PostDetails";
import PostEdit from "../pages/PostEdit";
import UserDetails from "../pages/UserDetails";

const AppRoutes = () => (
  <BrowserRouter>
    <VideosProvider>
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
        path="/bot-videos"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <BotVideosProvider>
                <VideoBotManagement />
              </BotVideosProvider>
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bot-videos/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <VideoBotDetails />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <PostManagement />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/upload"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <UploadPost />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <PostDetails />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/edit/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <PostEdit />
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
        path="/users/:id"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <UserDetails />
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
        path="/plateform-subcategories"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <PlateformSubCategoryManager />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plateform-categories"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <PlateformCategoryManager />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plateform-relations"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <PlateformRelationsManager />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post-categories"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <PostCategoryManager />
              </InsideSidebar>
            </SuperProtected>
          </ProtectedRoute>
        }
      />
      <Route
        path="/creators"
        element={
          <ProtectedRoute>
            <SuperProtected>
              <InsideSidebar>
                <CreatorManager />
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
        path="/touch/video/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <TouchVideo />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/touch/post/:id"
        element={
          <ProtectedRoute>
            <InsideSidebar>
              <TouchPost />
            </InsideSidebar>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </VideosProvider>
  </BrowserRouter>
);

export default AppRoutes;
