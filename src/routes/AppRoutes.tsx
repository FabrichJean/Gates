import EditMangasChapterPage from "../pages/EditMangasChapterPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import CreatorManager from "../pages/CreatorsManager";
import PostManagement from "../pages/PostManagement";
import UploadPost from "../pages/UploadPost";
import PostDetails from "../pages/PostDetails";
import PostEdit from "../pages/PostEdit";
import UserDetails from "../pages/UserDetails";
import VideoBotEdit from "../pages/VideoBotEdit";
import Synchronisation from "../pages/Synchronisation";
import CardFlottant from "../components/CardFlottant";
import useCardFlottant from "../hooks/useCardFlottant";
import TagCategory from "../pages/TagCategory";
import PostBotManagement from "../pages/PostBotManagement";
import PostBotDetails from "../pages/PostBotDetails";
import PostBotEdit from "../pages/PostBotEdit";
import Creatorr from "../pages/Creator";
import MediaPostManager from "../pages/MediaPostManager";

import Mangas from "../pages/Mangas";
import UploadMangas from "../pages/UploadMangas";
import EditMangasPage from "../pages/EditMangasPage";
import MangasDetailsPage from "../pages/MangasDetailsPage";
import UploadMangasEpisodePage from "../pages/UploadMangasEpisodePage";
import EditMangasEpisodePage from "../pages/EditMangasEpisodePage";
import MangasEpisodesPage from "../pages/MangasEpisodesPage";
import MangasEpisodeDetailsPage from "../pages/MangasEpisodeDetailsPage";
import MangaChaptersRouteWrapper from "../components/MangaChaptersRouteWrapper";
import MangasCategoriesPage from "../pages/MangasCategoriesPage";
import RomanUpload from "../pages/romans/romanUpload";
import RomansManagement from "../pages/romans/RomansManagement";
import RomanDetails from "../pages/romans/romanDetails";
import RomanEdit from "../pages/romans/romanEdit";
import RomanCategoryPage from "../pages/romans/romanCategory";
import RomanChapterManagement from "../pages/romans/romanChapterManagement";
import RomanChaptersPage from "../pages/romans/romanChapters";



const AppRoutes = () => {
  const { visible: modalFloat } = useCardFlottant();

  return (
    <BrowserRouter>
      <VideosProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/videos" />} />
          <Route path="/romans/upload"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanUpload />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route path="/romans"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomansManagement />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route path="/romans/:id"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanDetails />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route path="/romans/:id/edit"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanEdit />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          
          <Route path="/roman-category"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanCategoryPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />

          <Route path="/romans/chapters"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanChapterManagement />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />

          <Route path="/romans/:id/chapters"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <RomanChaptersPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mangas"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <Mangas />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/upload"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <UploadMangas />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <MangasDetailsPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/edit"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <EditMangasPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <MangaChaptersRouteWrapper />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters/:chapterId/edit"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <EditMangasChapterPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters/:chapterId/episodes/upload"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <UploadMangasEpisodePage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters/:chapterId/episodes"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <MangasEpisodesPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters/:chapterId/episodes/:episodeId"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <MangasEpisodeDetailsPage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas/:mangaId/chapters/:chapterId/episodes/:episodeId/edit"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <EditMangasEpisodePage />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mangas-categories"
            element={
              <ProtectedRoute>
                <SuperProtected>
                  <InsideSidebar>
                    <MangasCategoriesPage />
                  </InsideSidebar>
                </SuperProtected>
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
            path="/bot-posts"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <PostBotManagement />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bot-post/:id"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <PostBotDetails />
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
            path="/bot-posts/:id"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <PostBotDetails />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bot-videos/:id/edit"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <VideoBotEdit />
                </InsideSidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bot-posts/edit/:id"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <PostBotEdit />
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
            path="/post/edit-media/:id"
            element={
              <ProtectedRoute>
                <InsideSidebar>
                  <MediaPostManager />
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
            path="/tag-category"
            element={
              <ProtectedRoute>
                <SuperProtected>
                  <InsideSidebar>
                    <TagCategory />
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
            path="/creators/:id"
            element={
              <ProtectedRoute>
                <SuperProtected>
                  <InsideSidebar>
                    <Creatorr />
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
                <SuperProtected>
                  <InsideSidebar>
                    <Conversion />
                  </InsideSidebar>
                </SuperProtected>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SuperProtected>
                  <InsideSidebar>
                    <Settings />
                  </InsideSidebar>
                </SuperProtected>
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
          <Route
            path="/sync"
            element={
              <ProtectedRoute>
                <SuperProtected>
                  <InsideSidebar>
                    <Synchronisation />
                  </InsideSidebar>
                </SuperProtected>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {modalFloat && <CardFlottant />}
      </VideosProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
