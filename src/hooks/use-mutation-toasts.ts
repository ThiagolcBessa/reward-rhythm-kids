import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/notify';

interface MutationConfig<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  successToast?: { title: string; description?: string };
  errorToast?: { title: string; description?: string };
  invalidateQueries?: string[][];
}

export const useMutationWithToasts = <TData, TVariables, TError = Error>(
  config: MutationConfig<TData, TError, TVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: config.mutationFn,
    onSuccess: (data, variables) => {
      if (config.successToast) {
        notifySuccess(config.successToast.title, config.successToast.description);
      }
      
      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      config.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (config.errorToast) {
        let errorMessage: string;
        try {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as any).message;
          } else {
            errorMessage = String(error);
          }
        } catch {
          errorMessage = 'An error occurred';
        }
        notifyError(config.errorToast.title, config.errorToast.description || errorMessage);
      }
      
      config.onError?.(error, variables);
    }
  });
};