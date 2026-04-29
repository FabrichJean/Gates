import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import UserSelector, { type User } from './UserSelector';

interface SelectedUserModalProps {
  open: boolean;
  users: User[];
  selectedUserId?: number | null;
  selectedUserIds?: number[];
  onClose: () => void;
  onConfirm: (userIds: number[]) => void;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  multiple?: boolean;
}

const SelectedUserModal: React.FC<SelectedUserModalProps> = ({
  open,
  users,
  selectedUserId,
  selectedUserIds = [],
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading = false,
  multiple = false,
}) => {
  const [localSelectedUser, setLocalSelectedUser] = React.useState<User | null>(null);
  const [localSelectedUsers, setLocalSelectedUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (open) {
      if (multiple && selectedUserIds && selectedUserIds.length > 0) {
        const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
        setLocalSelectedUsers(selectedUsers);
      } else if (!multiple && selectedUserId) {
        const user = users.find(u => u.id === selectedUserId);
        setLocalSelectedUser(user || null);
      }
    } else {
      setLocalSelectedUser(null);
      setLocalSelectedUsers([]);
    }
  }, [selectedUserId, selectedUserIds, users, open, multiple]);

  const handleConfirm = () => {
    if (multiple) {
      if (localSelectedUsers.length > 0) {
        onConfirm(localSelectedUsers.map(u => u.id));
      }
    } else {
      if (localSelectedUser?.id) {
        onConfirm([localSelectedUser.id]);
      }
    }
  };

  const handleSelectUser = (user: User | null) => {
    if (multiple) {
      if (user) {
        const isSelected = localSelectedUsers.some(u => u.id === user.id);
        if (isSelected) {
          setLocalSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
          setLocalSelectedUsers(prev => [...prev, user]);
        }
      }
    } else {
      setLocalSelectedUser(user);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {multiple ? 'Select Admin Users' : 'Select Admin User'}
                </label>
                {multiple ? (
                  <div className="space-y-2">
                    <UserSelector
                      users={users}
                      selectedUserId={null}
                      onSelect={handleSelectUser}
                      placeholder="Add admin user..."
                      showValidationBadge={true}
                      allowClear={false}
                      className="w-full"
                      maxHeight={300}
                    />
                    {localSelectedUsers.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-3">
                          Selected users ({localSelectedUsers.length})
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex -space-x-2">
                            {localSelectedUsers.map(user => (
                              <motion.div
                                key={user.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.2 }}
                                onClick={() => handleSelectUser(user)}
                                className="group relative"
                              >
                                <img
                                  src={`https://api.dicebear.com/9.x/croodles/svg?seed=${user.username}`}
                                  alt={user.username}
                                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 ring-1 ring-blue-200 dark:ring-blue-800 cursor-pointer flex-shrink-0 transition-all duration-200"
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                  <button
                                    onClick={() => handleSelectUser(user)}
                                    className="px-2 py-1 text-xs bg-gray-900 dark:bg-gray-800 text-white rounded whitespace-nowrap flex items-center gap-1 hover:bg-red-600 transition-colors"
                                  >
                                    {user.username}
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <UserSelector
                    users={users}
                    selectedUserId={localSelectedUser?.id ?? null}
                    onSelect={handleSelectUser}
                    placeholder="Choose admin user..."
                    showValidationBadge={true}
                    allowClear={true}
                    className="w-full"
                    maxHeight={300}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={
                    loading ||
                    (multiple ? localSelectedUsers.length === 0 : !localSelectedUser?.id)
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Loading...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectedUserModal;
