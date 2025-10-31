import { useNavigate, useParams } from "react-router-dom";
import { UseVideo } from "../hooks/useVideos";
import { useRef, useState } from "react";
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

    const [coverPreview, setCoverPreview] = useState<string | null>(video.public_urls.cover_url);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(video.public_urls.temp_url);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [duration, setDuration] = useState<number | null>(video?.duration);

    const [category, setCategory] = useState<Category>(video?.category);
    const [subcategory, setSubCategory] = useState<SubCategory>(video?.subCategory);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
            toast.error("❌ Error: " + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50 p-6">
            <Toaster position="top-right" />
            <div className="flex flex-col w-full">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 self-start">
                    Edit
                </h1>
                <div className="flex md:flex-row flex-col gap-7 w-max bg-white rounded-lg p-8 border border-gray-200">
                    <div className="space-y-6">

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Category</label>
                            <CategoryAutoComplete defaultValue={category} onSelect={(cat) => setCategory(cat)} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Sub Category</label>
                            <SubCategoryAutoComplete categoryId={category?.id} defaultValue={subcategory} onSelect={(cat) => setSubCategory(cat)} />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Duration ( ms)</label>
                            <input type="number" className="input w-full" defaultValue={duration || 0} onChange={(e) => setDuration(Number(e.currentTarget.value))} />
                        </div>

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

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Video File</label>
                            <div
                                onClick={() => videoInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer relative"
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
                            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
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
