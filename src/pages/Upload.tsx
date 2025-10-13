import React, { useRef, useState } from "react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";

const Upload = () => {
	const [title, setTitle] = useState("");
	const [coverPreview, setCoverPreview] = useState<string | null>(null);
	const [videoPreview, setVideoPreview] = useState<string | null>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const videoInputRef = useRef<HTMLInputElement>(null);

	// ✅ gestion des fichiers
	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setVideoPreview(URL.createObjectURL(file));
		}
	};

	// ✅ simulation du clic sur input caché
	const handleCoverClick = () => coverInputRef.current?.click();
	const handleVideoClick = () => videoInputRef.current?.click();

	// ✅ soumission simulée
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert("🚀 Upload started!");
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
				{/* Header */}
				<h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
					🎬 Upload a Video
				</h1>

				<form className="space-y-6" onSubmit={handleSubmit}>
					{/* Title */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="(Multilingual supported)"
							className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
						/>
					</div>
					<LanguageAutoComplete />

					{/* Cover image */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Cover Image</label>
						<div
							onClick={handleCoverClick}
							className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer relative"
						>
							{coverPreview ? (
								<img
									src={coverPreview}
									alt="Preview"
									className="rounded-lg object-cover w-full h-52"
								/>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-10 w-10 text-gray-400 mb-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 16a4 4 0 01-.88-7.903A4.5 4.5 0 1115.9 6H16a4 4 0 110 8h-1m-3 4l-4-4m0 0l4-4m-4 4h12"
										/>
									</svg>
									<p className="text-gray-500 text-sm text-center">
										Click or drag an image (PNG, JPG, WEBP)
									</p>
								</>
							)}
							<input
								type="file"
								ref={coverInputRef}
								accept="image/*"
								onChange={handleCoverChange}
								className="hidden"
							/>
						</div>
					</div>

					{/* Video (optional) */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Video (optional)</label>
						<div
							onClick={handleVideoClick}
							className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer"
						>
							{videoPreview ? (
								<video
									src={videoPreview}
									controls
									className="rounded-lg w-full max-h-56 object-cover"
								/>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-10 w-10 text-gray-400 mb-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14.752 11.168l-4.197-2.398A1 1 0 009 9.618v4.764a1 1 0 001.555.832l4.197-2.398a1 1 0 000-1.664z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<p className="text-gray-500 text-sm text-center">
										Drag or select an MP4 file
									</p>
								</>
							)}
							<input
								type="file"
								ref={videoInputRef}
								accept="video/mp4"
								onChange={handleVideoChange}
								className="hidden"
							/>
						</div>
					</div>

					{/* Submit button */}
					<div className="flex justify-end">
						<button
							type="submit"
							className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
						>
							🚀 Publish
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Upload;
