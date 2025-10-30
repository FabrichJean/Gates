import { useState } from "react";

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

  return (
    <dialog open className="modal">
      <div className="modal-box flex flex-col gap-3">
        <textarea
          className="textarea w-full"
          placeholder="Describe here ..."
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>cancel</button>
          <button className="btn btn-error text-white" onClick={handleSubmit}>submit</button>
        </div>
      </div>
    </dialog>
  );
};

export default RefuseModal;
