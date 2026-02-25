import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  onSubmit: (comment: string) => void | Promise<void>;
}

const RefuseModal = ({ onClose, onSubmit }: Props) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!comment) return;
    await onSubmit(comment);
  };

  return createPortal(
    <dialog open className="modal">
      <div className="modal-box bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-700 flex flex-col gap-3 transition-colors duration-300">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">拒绝视频</h3>
        <textarea
          className="textarea w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
          placeholder="在此描述..."
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="btn bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="btn bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-none transition-colors duration-300"
            onClick={handleSubmit}
          >
            提交
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export default RefuseModal;
