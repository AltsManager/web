import { apiGet, apiJson, type QueryParams } from "./client";
import type { Page, Transaction, TransactionUpdateInput } from "./types";

export function listTransactions(params?: QueryParams): Promise<Page<Transaction>> {
  return apiGet<Page<Transaction>>("/api/v1/transactions", params);
}

export function getTransaction(id: string): Promise<Transaction> {
  return apiGet<Transaction>(`/api/v1/transactions/${id}`);
}

export function updateTransaction(
  id: string,
  input: TransactionUpdateInput
): Promise<Transaction> {
  return apiJson<Transaction>("PATCH", `/api/v1/transactions/${id}`, input);
}
