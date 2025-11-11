import { useState, useCallback } from 'react';

interface UseAnimatedAlertProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useAnimatedAlert = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    props: UseAnimatedAlertProps;
  }>({
    isOpen: false,
    props: { message: '' }
  });

  const showAlert = useCallback((props: UseAnimatedAlertProps) => {
    setAlertState({
      isOpen: true,
      props
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const alertProps = {
    ...alertState.props,
    isOpen: alertState.isOpen,
    onClose: hideAlert
  };

  return {
    showAlert,
    hideAlert,
    alertProps,
    isOpen: alertState.isOpen
  };
};

// Fonction utilitaire pour créer des alertes rapides
export const createQuickAlert = (
  showAlert: ReturnType<typeof useAnimatedAlert>['showAlert']
) => ({
  error: (message: string, title = 'Error') => 
    showAlert({ message, title, type: 'error' }),
  
  warning: (message: string, title = 'Warning') => 
    showAlert({ message, title, type: 'warning' }),
  
  info: (message: string, title = 'Information') => 
    showAlert({ message, title, type: 'info' }),
  
  success: (message: string, title = 'Success') => 
    showAlert({ message, title, type: 'success' }),
  
  confirm: (message: string, onConfirm: () => void, title = 'Confirm') =>
    showAlert({ 
      message, 
      title, 
      type: 'warning',
      onConfirm,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    })
});