import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { accessAPI } from "../api/access";
import SelectedUserModal from "./SelectedUserModal";
import RoleEnum from "../utils/roleEnum";

interface AvatarWithTooltipProps {
  access: any;
  reFetch: () => void;
}

const AvatarWithTooltip: React.FC<AvatarWithTooltipProps> = ({ access, reFetch }) => {
  const [isHovered, setIsHovered] = useState(false);
  const targetUser = access.targetUser;

  const handleRemoveAccess = async () => {
    try {
      await accessAPI.delete(access.id);
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove access");
    }
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ scale: isHovered ? 1.2 : 1 }}
      transition={{ duration: 0.2 }}
      className="relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 cursor-pointer flex-shrink-0 z-0 hover:z-50"
    >
      <img
        src={`https://api.dicebear.com/9.x/croodles/svg?seed=${targetUser?.username || "user"}`}
        alt={targetUser?.username}
        className="w-full h-full object-cover rounded-full"
      />
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleRemoveAccess}
              className="px-3 py-2 flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors rounded w-full"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Remove {targetUser?.username}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface VideoAccessManagerProps {
  resource_id: any;
  entity: "video" | "post" | "video_for_app" | "post_for_app";
  user: any;
  accesses: any[];
  selectableUsers: any[];
  reFetch: () => void;
  isUpdatingAccessOwner: boolean;
  setIsUpdatingAccessOwner: (loading: boolean) => void;
}

const VideoAccessManager: React.FC<VideoAccessManagerProps> = ({
  resource_id,
  user, entity,
  selectableUsers,
  reFetch, accesses,
  isUpdatingAccessOwner,
  setIsUpdatingAccessOwner,
}) => {
  const [isSelectUserModalOpen, setIsSelectUserModalOpen] = useState(false);
  const [isAccessesExpanded, setIsAccessesExpanded] = useState(false);

  const handleAccessOwnerConfirm = async (selectedUserIds: number[]) => {
    if (!resource_id) return;
    setIsUpdatingAccessOwner(true);
    try {
      await accessAPI.create({
        target_users: selectedUserIds,
        entity,
        resource_id,
      });
      toast.success("Access created successfully");
      setIsSelectUserModalOpen(false);
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create access");
    } finally {
      setIsUpdatingAccessOwner(false);
    }
  };

  if (user.role !== RoleEnum.SUPERADMIN) return null;

  return (
    <>
      {accesses?.length ? (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {accesses
              .slice(0, isAccessesExpanded ? undefined : 3)
              .map((access: any) => (
                <AvatarWithTooltip key={access.id} access={access} reFetch={reFetch} />
              ))}
            {accesses.length > 3 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAccessesExpanded(!isAccessesExpanded)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center border-2 border-white dark:border-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer flex-shrink-0"
                title={isAccessesExpanded ? "Show less" : `+${accesses.length - 3} more`}
              >
                {isAccessesExpanded ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 15l-7 7m0 0l-7-7"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">+{accesses.length - 3}</span>
                )}
              </motion.button>
            )}
          </div>
          {selectableUsers.length > 0 && (
            <button
              type="button"
              onClick={() => setIsSelectUserModalOpen(true)}
              className="cursor-pointer inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              title="Add more owners"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>
      ) : selectableUsers.length > 0 ? (
        <button
          type="button"
          onClick={() => setIsSelectUserModalOpen(true)}
          className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-sm font-medium transition-all duration-200 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-700"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          Assign owner
        </button>
      ) : null}

      <SelectedUserModal
        open={isSelectUserModalOpen}
        users={selectableUsers}
        selectedUserIds={[]}
        onClose={() => setIsSelectUserModalOpen(false)}
        onConfirm={handleAccessOwnerConfirm}
        title="Select access owners"
        description={`Choose owners.`}
        confirmLabel="Save"
        loading={isUpdatingAccessOwner}
        multiple={true}
      />
    </>
  );
};

export default VideoAccessManager;
