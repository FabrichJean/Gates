
import { useState } from "react";
import { MoreVertical } from "lucide-react"; // icône du menu (package: lucide-react)
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cdnS3 } from "../utils/cdn";


// import { useAuth } from "../hooks/useAuth";
// import { getDashboardData } from "../api/dashboard";
// import StatCard from "../components/dashboard/StatCard";
// import RevenueChart from "../components/dashboard/RevenueChart";

const Dashboard = () => {
	const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // fonction handle logout
  const handleLogout = () => {
    // confirmation avant de se deconnecter
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  }

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const videos = [
    {
      user: "fabrich.dev",
      title: "Introduction à React",
      status: "Waiting for Upload",
      cover: "https://placehold.co/80x50",
      duration: "4:32",
    },
    {
      user: "john_smith",
      title: "Node.js Fundamentals",
      status: "Uploaded",
      cover: "https://placehold.co/80x50",
      duration: "10:21",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🎬 Video Management</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher une vidéo..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500"
          />
          <Link to={"/upload"} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition">
            + upload
          </Link>
          {/* button deconnexion */}
          <button
            onClick={handleLogout}
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="py-3 px-6 text-left">Utilisateur</th>
              <th className="py-3 px-6 text-left">Titre</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Cover</th>
              <th className="py-3 px-6 text-center">Durée</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-700">
            {videos.map((video, index) => (
              <tr key={index} className="hover:bg-gray-50 transition relative">
                <td className="py-3 px-6">{video.user}</td>
                <td className="py-3 px-6">{video.title}</td>
                <td className="py-3 px-6">
                  {video.status === "Uploaded" ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Uploaded
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Waiting for Upload
                    </span>
                  )}
                </td>
                <td className="py-3 px-6 text-center">
                  <img
                    src={cdnS3(video.cover)}
                    alt="cover"
                    className="w-20 h-12 object-cover rounded-lg mx-auto"
                  />
                </td>
                <td className="py-3 px-6 text-center">{video.duration}</td>

                {/* Menu déroulant */}
                <td className="py-3 px-6 text-center relative">
                  <button
                    onClick={() => toggleMenu(index)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>

                  {openMenu === index && (
                    <div className="absolute right-6 mt-2 w-40 bg-white border border-gray-200 shadow-xl rounded-xl z-10 animate-fade-in">
                      <ul className="text-start text-sm text-gray-700">
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => alert("Transcodage lancé")}
                        >
                          🎞️ Transcoder
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => alert("Upload vers S3")}
                        >
                          ☁️ Upload S3
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => alert("Prévisualisation")}
                        >
                          ▶️ Preview
                        </li>
                        <li
                          className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => alert("Vidéo supprimée")}
                        >
                          🗑️ Supprimer
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
