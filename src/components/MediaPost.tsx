// components/VideoCoverManager.tsx
import React, { useEffect, useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import FileUploadZone from './FileUploadZone';
import UploadProgress from './UploadProgress';
import axios from 'axios';
import { UsePost } from '../hooks/usePost';
import { videoToVideoCoverCouple } from '../utils/video';
import { getToken } from '../utils/storage';
import { deleteManyVideos } from '../api/posts';

export interface VideoCoverCouple {
  key: string;
  data_id?: string;
  videoFile: File | null;
  coverFile: File | null;
  videoPreview: string;
  coverPreview: string;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  upload?: boolean;
  metadata?: any;
}

interface VideoCoverManagerProps {
  apiEndpoint: string;
  onUploadComplete?: (couples: VideoCoverCouple[]) => void;
  id: string;
}

const MediaPost: React.FC<VideoCoverManagerProps> = ({
  apiEndpoint, id,
  onUploadComplete
}) => {
  const { data: post, reFetch } = UsePost(id);

  const [couples, setCouples] = useState<VideoCoverCouple[]>([]);

  useEffect(() => {
    const parsedCouples = post?.videos.map(videoToVideoCoverCouple) ?? [];
    setCouples(parsedCouples);
    
  }, [post])

  const addNewCouple = () => {
    const newCouple: VideoCoverCouple = {
      key: Date.now().toString(),
      videoFile: null,
      coverFile: null,
      videoPreview: '',
      coverPreview: '',
      isUploading: false,
      uploadProgress: 0
    };
    setCouples([newCouple, ...couples,]);
  };

  const updateCouple = (key: string, updates: Partial<VideoCoverCouple>) => {
    setCouples(couples.map(couple => 
      couple.key === key ? { ...couple, ...updates } : couple
    ));
  };

  const removeCouple = async (couple?: VideoCoverCouple) => {
    if(!couple?.data_id) {
      setCouples(couples.filter(c => c.key !== couple?.key));
      return;
    };
    if(!window.confirm('Êtes-vous sûr de vouloir supprimer ce couple ?'))
      return;
    try{
      await deleteManyVideos([Number(id)])
      reFetch()
    } catch (error) {
      console.log(error);
    }
  };

  const uploadCouple = async (key: string) => {
    const couple = couples.find(c => c.key === key);
    // if (!couple?.videoFile || !couple?.coverFile) return;

    updateCouple(key, { isUploading: true, error: undefined });

    const formData = new FormData();
    formData.append('video', couple?.videoFile!);
    formData.append('cover', couple?.coverFile!);

    try {
      await axios.put(`${apiEndpoint}/${couple?.data_id}`, formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      updateCouple(key, { 
        isUploading: false,
        uploadProgress: 100
      });

      reFetch()

    } catch (error) {
      updateCouple(id, { 
        isUploading: false,
        error: 'Erreur lors de l\'upload'
      });
    }
  };

  const uploadAll = async () => {
    const validCouples = couples.filter(c => c.upload);
    
    for (const couple of validCouples) {
      await uploadCouple(couple.key);
    }

    if (onUploadComplete) {
      onUploadComplete(couples);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Vidéo/Couverture
          </h2>
          <button
            onClick={addNewCouple}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un couple
          </button>
        </div>

        <div className="grid gap-6">
          {couples.map((couple) => (
            <div key={couple.key} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Zone vidéo */}
                <FileUploadZone
                  type="video"
                  accept="video/*"
                  title="Vidéo"
                  file={couple.videoFile}
                  preview={couple.videoPreview}
                  onFileSelect={(file, preview) => 
                    updateCouple(couple.key, { 
                      videoFile: file, 
                      videoPreview: preview,
                      upload: true
                    })
                  }
                  disabled={couple.isUploading}
                />

                {/* Zone couverture */}
                <FileUploadZone
                  type="image"
                  accept="image/*"
                  title="Image de couverture"
                  file={couple.coverFile}
                  preview={couple.coverPreview}
                  onFileSelect={(file, preview) => 
                    updateCouple(couple.key, { 
                      coverFile: file, 
                      coverPreview: preview,
                      upload: true
                    })
                  }
                  disabled={couple.isUploading}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => uploadCouple(couple.key)}
                    disabled={!couple.upload}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {couple.isUploading ? 'Upload...' : 'Uploader'}
                  </button>
                  <button
                    onClick={() => removeCouple(couple)}
                    disabled={couple.isUploading}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>

                {couple.isUploading && (
                  <UploadProgress progress={couple.uploadProgress} />
                )}
                
                {couple.error && (
                  <span className="text-red-600 text-sm">{couple.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {couples.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <button
              disabled={!!couples.find(c => !c.upload)}
              onClick={uploadAll}
              className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${couples.some(c => !c.upload) ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Tout uploader
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPost;