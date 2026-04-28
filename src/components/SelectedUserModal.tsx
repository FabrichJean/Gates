import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import UserSelector, { type User } from './UserSelector';

interface SelectedUserModalProps {
  open: boolean;
  users: User[];
  selectedUserId: number | null;
  onClose: () => void;
  onConfirm: (userId: number) => void;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
}

const SelectedUserModal: React.FC<SelectedUserModalProps> = ({
  open,
  users,
  selectedUserId,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading = false,
}) => {
  const [localSelectedUser, setLocalSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (open && selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      setLocalSelectedUser(user || null);
    } else if (!open) {
      setLocalSelectedUser(null);
    }
  }, [selectedUserId, users, open]);

  const handleConfirm = () => {
    if (localSelectedUser?.id) {
      onConfirm(localSelectedUser.id);
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
                  Select Admin User
                </label>
                <UserSelector
                  users={users}
                  selectedUserId={localSelectedUser?.id ?? null}
                  onSelect={setLocalSelectedUser}
                  placeholder="Choose admin user..."
                  showValidationBadge={true}
                  allowClear={true}
                  className="w-full"
                  maxHeight={300}
                />
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
                  disabled={!localSelectedUser?.id || loading}
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
