import { useNavigate, useParams } from "react-router-dom";
import { UseVideo } from "../hooks/useVideos";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import { updateVideo } from "../api/videos";
import toast, { Toaster } from "react-hot-toast";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import { TitlesForm } from "./Upload";


function TouchVideo() {
    const { id: videoId } = useParams<{ id: string }>();
    const { data: video } = UseVideo(videoId);

    const navigate = useNavigate()

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [coverPreview, setCoverPreview] = useState<string | null>(video?.public_urls.cover_url || video?.cover);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(video?.public_urls.temp_url || video?.local_mp4_path);
    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (video?.public_urls.cover_url) {
            setCoverPreview(video.public_urls.cover_url);
        } else if (video?.cover) {
            setCoverPreview(video.cover);
        }

        if (video?.public_urls.temp_url) {
            setVideoPreview(video.public_urls.temp_url);
        } else if (video?.local_mp4_path) {
            setVideoPreview(video.local_mp4_path);
        }
    }, [video]);

    useEffect(() => {
        if (video?.public_urls.temp_url) {
            setVideoPreview(video.public_urls.temp_url);
        } else if (video?.local_mp4_path) {
            setVideoPreview(video.local_mp4_path);
        }
    }, [video]);

    const [duration, setDuration] = useState<number | null>(video?.duration);

    const [category, setCategory] = useState<Category>(video?.category);
    const [subcategory, setSubCategory] = useState<SubCategory>(video?.subCategory);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignorefpublicjzzz
    const [coupleTitles, setCoupleTitles] = useState<Couple[]>(video?.titles || []);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverClick = () => coverInputRef.current?.click();

    const handleSubmit = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData: any = {
            ...(coverFile && { cover: coverFile }),
            ...(videoFile && { video: videoFile }), // ✅ Ajout du fichier vidéo
            ...(category && { category_id: category.id }),
            ...(subcategory && { sub_category_id: subcategory.id }),
            titles: JSON.stringify(coupleTitles),
            duration,
            touching: true
        };


        try {
            setUploading(true);
            setProgress(0);

            console.log(formData.titles);

            const res = await updateVideo(video.id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            toast.success("✅ successfull !");
            console.log("Video updated:", res.data);
            navigate('/videos')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            toast.error("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }; 

    return (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
            <Toaster position="top-right" />
            <div className="flex flex-col w-full">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
                    Touch video {video?.id}
                </h1>
                <div className="flex md:flex-row flex-col gap-7 w-max bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                    <div className="space-y-6">

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Category</label>
                            <CategoryAutoComplete defaultValue={category} onSelect={(cat) => setCategory(cat)} />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Sub Category</label>
                            <SubCategoryAutoComplete categoryId={category?.id} defaultValue={subcategory} onSelect={(cat) => setSubCategory(cat)} />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Duration ( ms)</label>
                            <input type="number" className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300" defaultValue={duration || 0} onChange={(e) => setDuration(Number(e.currentTarget.value))} />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Cover Image</label>
                            <div
                                onClick={handleCoverClick}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer relative"
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
                                            className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-300"
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
                                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">
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

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">Video File</label>
                            <div
                                onClick={() => videoInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer relative"
                            >
                                {videoPreview ? (
                                    <video
                                        src={videoPreview}
                                        controls
                                        className="rounded-lg object-cover w-full h-52"
                                    />
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-300"
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
                                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">
                                            Click or drag a video (MP4, WEBM, AVI)
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setVideoFile(file);
                                            setVideoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>


                        {/* Barre de progression */}
                        {uploading && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden transition-colors duration-300">
                                <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-colors duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </div>

                    <TitlesForm btnSubmit="✏️ update" coupleTitles={coupleTitles} setCoupleTitles={setCoupleTitles} progress={progress} uploading={uploading} handleSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    );

}

export default TouchVideo
