const Upload = () => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
				{/* Header */}
				<h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
					🎬 Upload
				</h1>
				<form className="space-y-6">
					{/* Titre multilingue */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Title</label>
						<div className="flex flex-col gap-4">
							<div>
								<input type="text" placeholder="(multilingual supported)" className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
							</div>
						</div>
					</div>
					{/* Cover image */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Image de couverture</label>
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A4.5 4.5 0 1115.9 6H16a4 4 0 110 8h-1m-3 4l-4-4m0 0l4-4m-4 4h12" />
							</svg>
							<p className="text-gray-500 text-sm text-center">Cliquez pour sélectionner une image (PNG, JPG, WEBP)</p>
							<input type="file" accept="image/*" className="hidden" id="coverInput" />
						</div>
					</div>
					{/* Vidéo MP4 (optionnelle) */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">Video (optional)</label>
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-4.197-2.398A1 1 0 009 9.618v4.764a1 1 0 001.555.832l4.197-2.398a1 1 0 000-1.664z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p className="text-gray-500 text-sm text-center">Drag or select an MP4 video</p>
							<input type="file" accept="video/mp4" className="hidden" id="videoInput" />
						</div>
					</div>
					{/* Bouton de soumission */}
					<div className="flex justify-end">
						<button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition">
							🚀 Publish
						</button>
					</div>
				</form>
			</div>
		</div>

	);
};

export default Upload;
