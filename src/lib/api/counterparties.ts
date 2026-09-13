import { apiGet, apiJson, type QueryParams } from "./client";
import type { Counterparty, CounterpartyInput, Page } from "./types";

export function listCounterparties(params?: QueryParams): Promise<Page<Counterparty>> {
  return apiGet<Page<Counterparty>>("/api/v1/counterparties", params);
}

export function getCounterparty(id: string): Promise<Counterparty> {
  return apiGet<Counterparty>(`/api/v1/counterparties/${id}`);
}

export function createCounterparty(input: CounterpartyInput): Promise<Counterparty> {
  return apiJson<Counterparty>("POST", "/api/v1/counterparties", input);
}

export function updateCounterparty(
  id: string,
  input: Partial<CounterpartyInput>
): Promise<Counterparty> {
  return apiJson<Counterparty>("PATCH", `/api/v1/counterparties/${id}`, input);
}

export function deleteCounterparty(id: string): Promise<void> {
  return apiJson<void>("DELETE", `/api/v1/counterparties/${id}`);
}
