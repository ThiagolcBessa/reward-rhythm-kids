// src/hooks/use-mutation-toasts.ts
import { useMutation, UseMutationOptions, QueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess, pgFriendlyMessage } from "@/lib/notify";
import { useQueryClient } from "@tanstack/react-query";

type Key = readonly unknown[];

type ToastOpts<TData = any> = {
  success?: { title: string; description?: string };
  error?: { title: string; description?: string }; // description will be replaced by pgFriendlyMessage(err)
  invalidate?: Key[];
  refetch?: Key[];
  onSuccessExtra?: (data: TData) => void | Promise<void>;
  onErrorExtra?: (err: any) => void | Promise<void>;
};

type MutationOpts<TData, TVariables> = {
  onSuccess?: (data: TData, vars: TVariables, ctx: unknown) => void | Promise<void>;
  onError?: (err: any, vars: TVariables, ctx: unknown) => void | Promise<void>;
} & Omit<UseMutationOptions<TData, any, TVariables, unknown>, "mutationFn" | "onSuccess" | "onError">;

export function useMutationWithToasts<TData = any, TVariables = any>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  opts: ToastOpts<TData> = {},
  reactOpts?: MutationOpts<TData, TVariables>
) {
  const qc = useQueryClient();

  return useMutation<TData, any, TVariables>({
    ...(reactOpts || {}),
    mutationFn,
    onSuccess: async (data, vars, ctx) => {
      if (opts.success) notifySuccess(opts.success.title, opts.success.description);
      await invalidateOrRefetch(qc, opts);
      if (opts.onSuccessExtra) await opts.onSuccessExtra(data);
      if (reactOpts?.onSuccess) await reactOpts.onSuccess(data, vars, ctx);
    },
    onError: async (err, vars, ctx) => {
      const friendly = pgFriendlyMessage(err);
      const title = opts.error?.title ?? "Action failed";
      notifyError(title, friendly);
      if (opts.onErrorExtra) await opts.onErrorExtra(err);
      if (reactOpts?.onError) await reactOpts.onError(err, vars, ctx);
    },
  });
}

async function invalidateOrRefetch(qc: QueryClient, opts: ToastOpts<any>) {
  if (opts.invalidate?.length) {
    await Promise.all(opts.invalidate.map((k) => qc.invalidateQueries({ queryKey: k })));
  }
  if (opts.refetch?.length) {
    await Promise.all(opts.refetch.map((k) => qc.refetchQueries({ queryKey: k })));
  }
}