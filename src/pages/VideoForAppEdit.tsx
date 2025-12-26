import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import toast from "react-hot-toast";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import { TitlesForm } from "./Upload";
import { UseAppVideo } from "../hooks/app/useAppVideos";
import { updateVideoForApp } from "../api/videoForApp";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import type { Platform } from "../hooks/usePlatform";

function VideoForAppEdit() {
  const { id: videoId } = useParams<{ id: string }>();
  const { data: video } = UseAppVideo(videoId);

  const navigate = useNavigate();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(video?.cover);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCoverPreview(video?.cover);
  }, [video]);

  const [duration, setDuration] = useState<number | null>(video?.seconds);
  const [videoType, setVideoType] = useState<string>(video?.type);
  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(video?.subCategory);
  const [creator, setCreator] = useState<string | null>(video?.creatorObj?.name ?? null);
  const [creatorId, setCreatorId] = useState<number | null>(video?.creatorObj?.id ?? null);
  const [platform, setPlatform] = useState<Platform>(video?.plateform);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();

  const handleSubmit = async () => {
    try {
      const payload: any = {
        seconds: duration,
        type: videoType,
        category_id: category?.id,
        sub_category_id: subcategory?.id,
        creator_id: creatorId,
        plateform_id: platform?.id,
      };
      await updateVideoForApp(Number(videoId), payload);
      toast.success("Video updated!");
      navigate(`/app-videos/${videoId}`);
    } catch (err) {
      toast.error("Failed to update video");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit App Video</h1>
      <div className="grid grid-cols-2 gap-2">
        <label>Seconds: <input type="number" className="border px-2 py-1 rounded w-full" value={duration || 0} onChange={e => setDuration(Number(e.target.value))} /></label>
        <label>Type: <input className="border px-2 py-1 rounded w-full" value={videoType || ''} onChange={e => setVideoType(e.target.value)} /></label>
        {/* Add more fields as needed */}
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
        Update
      </button>
    </div>
  );
}

export default VideoForAppEdit;
