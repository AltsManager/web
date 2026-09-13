import { ApiError } from "@/lib/api/client";

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length <= 10 ? value : new Date(value).toLocaleString();
}

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
