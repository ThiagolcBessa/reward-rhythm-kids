import { showToast } from './toast-bus';

export const notifySuccess = (title: string, description?: string) => {
  showToast({ title, description, variant: 'default' });
};

export const notifyError = (title: string, description?: string) => {
  // Handle common Postgres error codes with friendly messages
  let friendlyDescription = description;
  
  if (description?.includes('23505')) {
    friendlyDescription = 'This item already exists';
  } else if (description?.includes('23503')) {
    friendlyDescription = 'Cannot delete - item is being used elsewhere';
  } else if (description?.includes('42501')) {
    friendlyDescription = 'You do not have permission for this action';
  }
  
  showToast({ title, description: friendlyDescription, variant: 'destructive' });
};

export const pgFriendlyMessage = (error: string): string => {
  if (error.includes('23505')) {
    return 'This item already exists';
  } else if (error.includes('23503')) {
    return 'Cannot delete - item is being used elsewhere';
  } else if (error.includes('42501')) {
    return 'You do not have permission for this action';
  }
  return error;
};