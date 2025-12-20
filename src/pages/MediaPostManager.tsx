import MediaPost from '../components/MediaPost';
import { apiURL } from '../constant';
import { useParams } from 'react-router-dom';

function MediaPostManager() {
  const { id } = useParams<{ id: string }>();

  const handleUploadComplete = (couples: any) => {
    console.log('Upload completed:', couples);
    // Redirection ou notification de succès
  };

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
