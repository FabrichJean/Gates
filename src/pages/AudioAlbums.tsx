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

  if (loading) return <div className="text-center py-20 text-lg text-gray-500 dark:text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8 text-indigo-700 dark:text-indigo-400">Audio Albums</h1>
      <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ID</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ref</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Album #</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total Tracks</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Audio</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">isDeleted</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {albums.map(album => (
            <tr key={album.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-mono text-sm">{album.id}</td>
              <td className="px-6 py-4">{album.ref}</td>
              <td className="px-6 py-4">{album.album_number}</td>
              <td className="px-6 py-4">{album.total_tracks}</td>
              <td className="px-6 py-4">{album.audio_id}</td>
              <td className="px-6 py-4">{album.user_id}</td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${album.isDeleted ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {album.isDeleted ? 'Supprimé' : 'Actif'}
                </span>
              </td>
              <td className="px-6 py-4">
                <a href={`/audio-albums/${album.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Détails</a>
                <span className="mx-2 text-gray-400">|</span>
                <a href={`/audio-albums/${album.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Éditer</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/audio-albums/upload" className="inline-block mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-md hover:bg-indigo-700 transition">Créer un album</a>
    </div>
  );
};

export default AudioAlbums;
