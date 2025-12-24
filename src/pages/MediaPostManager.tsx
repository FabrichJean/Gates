import MediaPost from '../components/MediaPost';
import { apiURL } from '../constant';
import { useParams } from 'react-router-dom';

function MediaPostManager() {
  const { id } = useParams<{ id: string }>();

  const handleUploadComplete = (couples: any) => {};

  return (
    <div className="min-h-screen bg-gray-100">
      <MediaPost 
        id={id || ""}
        apiEndpoint={`${apiURL}/posts/${id}/medias`}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

export default MediaPostManager;
