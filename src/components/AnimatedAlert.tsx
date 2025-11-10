import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  type = 'warning',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case 'error':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200'
        };
      case 'success':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200'
        };
      default: // warning
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, titleColor } = getIconAndColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Alert Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className={`
              w-full max-w-md mx-auto p-6 rounded-xl border shadow-2xl
              ${bgColor} ${borderColor}
              backdrop-blur-md
            `}>
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className={`flex-shrink-0 ${iconColor}`}
                >
                  {icon}
                </motion.div>
                
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className={`text-lg font-semibold ${titleColor}`}
                  >
                    {title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-gray-700 dark:text-gray-300 mt-1"
                  >
                    {message}
                  </motion.p>
                </div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex gap-3 justify-end"
              >
                {onConfirm ? (
                  <>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className={`
                        px-4 py-2 text-sm font-medium text-white rounded-lg
                        transition-all duration-200 hover:scale-105 active:scale-95
                        ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                          type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                          type === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-yellow-600 hover:bg-yellow-700'}
                      `}
                    >
                      {confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className={`
                      px-6 py-2 text-sm font-medium text-white rounded-lg
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                        type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        type === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-yellow-600 hover:bg-yellow-700'}
                    `}
                  >
                    {confirmText}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnimatedAlert;