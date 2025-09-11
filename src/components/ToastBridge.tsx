import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { setToast } from '@/lib/toast-bus';

export const ToastBridge = () => {
  const { toast } = useToast();

  useEffect(() => {
    setToast(toast);
    
    // Cleanup on unmount
    return () => setToast(() => {});
  }, [toast]);

  return null;
};