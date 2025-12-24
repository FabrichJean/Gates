import React, { useEffect, useState } from "react";
import { getAudioAlbumsApi } from "../api/audioAlbum";

const AudioAlbums: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAudioAlbumsApi().then(res => {
      setAlbums(res.data?.items || res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audio Albums</h1>
      <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Ref</th>
            <th className="px-4 py-2">Album #</th>
            <th className="px-4 py-2">Total Tracks</th>
            <th className="px-4 py-2">Plateform</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {albums.map(album => (
            <tr key={album.id} className="border-t">
              <td className="px-4 py-2">{album.id}</td>
              <td className="px-4 py-2">{album.ref}</td>
              <td className="px-4 py-2">{album.album_number}</td>
              <td className="px-4 py-2">{album.total_tracks}</td>
              <td className="px-4 py-2">{album.plateform_id}</td>
              <td className="px-4 py-2">
                <a href={`/audio-albums/${album.id}`} className="text-indigo-600 hover:underline">Détails</a>
                <span className="mx-2">|</span>
                <a href={`/audio-albums/${album.id}/edit`} className="text-blue-600 hover:underline">Éditer</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/audio-albums/upload" className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">Créer un album</a>
    </div>
  );
};

export default AudioAlbums;
