// src/lib/notify.ts
import { showToast } from "@/lib/toast-bus";

export const notifySuccess = (title: string, description?: string) =>
  showToast({ title, description });

export const notifyError = (title: string, description?: string) =>
  showToast({ title, description, variant: "destructive" });

// Map common PG errors to friendly messages
export function pgFriendlyMessage(err: unknown): string {
  const msg = String((err as any)?.message || err || "");
  const code = (err as any)?.code || (err as any)?.error?.code;

  if (code === "23505" || /duplicate key value/i.test(msg)) {
    return "This record already exists.";
  }
  if (code === "42501" || /rls|permission denied/i.test(msg)) {
    return "You don't have permission to perform this action.";
  }
  if (/network|fetch|failed to fetch/i.test(msg)) {
    return "Network error. Check your connection and try again.";
  }
  return msg;
}