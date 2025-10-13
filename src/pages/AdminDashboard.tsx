import { useState } from "react";
import { Link } from "react-router-dom";
import UseVideos from "../hooks/useVideos";
import { server } from "../constant";

export type Video = {
    id: unknown;
    user_id: unknown;
    hls_url: unknown;
    category_id: unknown;
    temp_url: unknown;
    url: string;
    transfer_status: unknown;
    upload_status: unknown;
    cover: unknown;
    duration: unknown;
    sequence: unknown;
    isDeleted: unknown;
}

const videos: Video[] = [
  {
    id: 1,
    user_id: 1,
    hls_url: "https://example.com/video1.m3u8",
    category_id: 1,
    temp_url: "https://example.com/temp/video1.mp4",
    url: "https://example.com/video1.mp4",
    transfer_status: "completed",
    upload_status: "uploaded",
    cover: "https://placehold.co/80x50",
    title: "Introduction à React",
    status: "Waiting for Upload",
    cover: "https://placehold.co/80x50",
    duration: "4:32",
  },
  {
    id: 2,
    user_id: 2,
    hls_url: "https://example.com/video2.m3u8",
    category_id: 2,
    temp_url: "https://example.com/temp/video2.mp4",
    url: "https://example.com/video2.mp4",
    transfer_status: "completed",
    upload_status: "uploaded",
    cover: "https://placehold.co/80x50",
    // title: "Node.js Fundamentals",
    status: "Uploaded",
    cover: "https://placehold.co/80x50",
    duration: "10:21",
  },
];

const AdminDashboard = () => {

  const { data } = UseVideos();

  console.log(data?.videos);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Video Management</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher une vidéo..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500"
          />
          <Link to={"/upload"} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition">
            + upload
          </Link>
        </div>
      </header>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="py-3 px-6 text-left">Ref</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Cover</th>
              <th className="p
              y-3 px-6 text-center">Duration</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-700">
            {data?.videos?.map((video, index) => (
              <tr key={index} className="hover:bg-gray-50 transition relative">
                <td className="py-3 px-6">{video.ref}</td>
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
                    src={server+'/'+video.cover}
                    alt="cover"
                    className="w-20 h-12 object-cover rounded-lg mx-auto"
                  />
                </td>
                <td className="py-3 px-6 text-center">{video.duration}</td>

                {/* Menu déroulant */}
                <td className="py-3 px-6 text-center relative">
                  {/* <button
                    onClick={() => toggleMenu(index)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button> */}

                  <ul className="flex justify-center text-start text-sm text-gray-700">
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
                    <Link to={"/videos/123"}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => alert("Upload vers S3")}
                    >
                      Update
                    </Link>
                  </ul>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
