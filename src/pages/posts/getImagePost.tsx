import { useState } from "react";
import { Images, X } from "lucide-react";
import type { Image } from "../../hooks/usePost";

interface GetImagePostProps {
  images: Image[];
}

const GetImagePost = ({ images }: GetImagePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Images ({images.length})
          </p>
          {images.length > 3 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Images size={18} />
              <span>Voir plus ({images.length - 3})</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {images.slice(0, 3).map((image, index) => {
            const imageUrl = image.public_urls?.local_image_url;
            return (
              <img
                key={index}
                src={imageUrl || ""}
                alt={`image-${index}`}
                className="w-full md:w-64 h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
              />
            );
          })}
        </div>
      </div>

      {/* Modal DaisyUI pour afficher toutes les images */}
      <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-6xl w-11/12 max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-2xl">
              Toutes les images ({images.length})
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => {
              const imageUrl = image.public_urls?.local_image_url;
              return (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl || ""}
                    alt={`image-${index}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                  />
                  <div className="absolute top-2 right-2 badge badge-neutral">
                    {index + 1}/{images.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default GetImagePost;
