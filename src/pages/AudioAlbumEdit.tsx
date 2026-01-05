import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAudioAlbumByIdApi, updateAudioAlbumApi } from "../api/audioAlbum";
import toast from "react-hot-toast";

const AudioAlbumEdit: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
			if (id) {
				getAudioAlbumByIdApi(Number(id)).then(res => {
					setForm(res.data || res);
					setLoading(false);
				}).catch(() => setLoading(false));
			}
	}, [id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		if (type === "checkbox") {
			setForm((prev: any) => ({ ...prev, [name]: (e.target as any).checked }));
		} else {
			setForm((prev: any) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const formData = new FormData();
					Object.entries(form).forEach(([key, value]) => {
						if (typeof value === "boolean") formData.append(key, value ? "true" : "false");
						else if (value !== undefined && value !== null) formData.append(key, String(value));
					});
					await updateAudioAlbumApi(Number(id), formData);
			toast.success("Album mis à jour !");
			navigate("/audio-albums");
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Erreur lors de la mise à jour");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="text-center py-20 text-lg text-gray-500 dark:text-gray-400">Chargement...</div>;
	if (!form) return <div className="text-center py-20 text-lg text-red-500">Album introuvable</div>;

	return (
		<div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-8">
			<h1 className="text-3xl font-black mb-8 text-indigo-700 dark:text-indigo-400">Éditer AudioAlbum</h1>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Référence</label>
					<input name="ref" value={form.ref} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" required />
				</div>
				<div className="flex gap-4">
					<div className="flex-1">
						<label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Numéro d'album</label>
						<input name="album_number" value={form.album_number} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
					</div>
					<div className="flex-1">
						<label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Nombre de pistes</label>
						<input name="total_tracks" value={form.total_tracks} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
					</div>
				</div>
				<div>
					<label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Date de sortie</label>
					<input name="release_date" value={form.release_date} onChange={handleChange} type="date" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
				</div>
				<div className="flex items-center gap-3">
					<input type="checkbox" name="isDeleted" checked={form.isDeleted} onChange={handleChange} id="isDeleted" className="accent-indigo-600 w-5 h-5" />
					<label htmlFor="isDeleted" className="font-semibold text-gray-700 dark:text-gray-200">Marquer comme supprimé</label>
				</div>
				<button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
					{saving ? "Mise à jour..." : "Mettre à jour l'album"}
				</button>
			</form>
		</div>
	);
};

export default AudioAlbumEdit;
