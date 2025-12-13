import { AlertCircle, CheckCircle, Pause, Upload, X } from "lucide-react";
import { useProgressStore } from "../../hooks/useProgressStore";
import { Link } from "react-router-dom";

export default function ProcessVideo() {
   
    const {uploads: taskList} = useProgressStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      case 'paused':
        return 'En pause';
      default:
        return 'En attente';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateTotalProgress = () => {
    if (taskList.length === 0) return 0;
    const totalProgress = taskList.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / taskList.length);
  }

  return (
    <div className="p-4 overflow-y-auto max-h-96">
      <div className="space-y-3">
        {taskList.map((task, index) => (
          <div
            key={`${task.videoId}-${index}`}
            className="rounded-lg p-4 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Link to={`/videos/${task.videoId}}`} className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Vidéo #{task.videoId}
                    </Link>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )} bg-opacity-20 text-${
                        getStatusColor(task.status).split("-")[1]
                      }-700`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <p className="text-xs dark:text-white text-gray-500 mt-1 break-all">
                    {task.file}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-medium dark:text-white text-gray-900">
                  {task.progress}%
                </p>
                <p className="text-xs dark:text-white text-gray-500">
                  {task.finish}/{task.total}
                </p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(
                  task.status
                )}`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>

            {/* Détails */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Utilisateur #{task.userId}</span>
              <span>{formatFileSize(task.total * 1024 * 1024)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
