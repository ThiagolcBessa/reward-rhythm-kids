import { toast } from 'sonner';

export const showToast = ({ title, description, variant }: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) => {
  if (variant === 'destructive') {
    toast.error(title, { description });
  } else {
    toast.success(title, { description });
  }
};