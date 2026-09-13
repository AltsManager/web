import { apiGet, apiJson, type QueryParams } from "./client";
import type {
  Document,
  Investment,
  InvestmentCounterparty,
  InvestmentCounterpartyInput,
  InvestmentInput,
  Ownership,
  OwnershipInput,
  Page,
  Transaction,
  TransactionInput,
} from "./types";

export function listInvestments(params?: QueryParams): Promise<Page<Investment>> {
  return apiGet<Page<Investment>>("/api/v1/investments", params);
}

export function getInvestment(id: string): Promise<Investment> {
  return apiGet<Investment>(`/api/v1/investments/${id}`);
}

export function createInvestment(input: InvestmentInput): Promise<Investment> {
  return apiJson<Investment>("POST", "/api/v1/investments", input);
}

export function updateInvestment(
  id: string,
  input: Partial<InvestmentInput>
): Promise<Investment> {
  return apiJson<Investment>("PATCH", `/api/v1/investments/${id}`, input);
}

export function deleteInvestment(id: string): Promise<void> {
  return apiJson<void>("DELETE", `/api/v1/investments/${id}`);
}

export function listInvestmentOwnerships(
  id: string,
  params?: QueryParams
): Promise<Page<Ownership>> {
  return apiGet<Page<Ownership>>(`/api/v1/investments/${id}/ownerships`, params);
}

export function createInvestmentOwnership(
  id: string,
  input: OwnershipInput
): Promise<Ownership> {
  return apiJson<Ownership>("POST", `/api/v1/investments/${id}/ownerships`, input);
}

export function listInvestmentTransactions(
  id: string,
  params?: QueryParams
): Promise<Page<Transaction>> {
  return apiGet<Page<Transaction>>(`/api/v1/investments/${id}/transactions`, params);
}

export function createInvestmentTransaction(
  id: string,
  input: TransactionInput
): Promise<Transaction> {
  return apiJson<Transaction>("POST", `/api/v1/investments/${id}/transactions`, input);
}

export function listInvestmentCounterparties(
  id: string,
  params?: QueryParams
): Promise<Page<InvestmentCounterparty>> {
  return apiGet<Page<InvestmentCounterparty>>(`/api/v1/investments/${id}/counterparties`, params);
}

export function createInvestmentCounterparty(
  id: string,
  input: InvestmentCounterpartyInput
): Promise<InvestmentCounterparty> {
  return apiJson<InvestmentCounterparty>(
    "POST",
    `/api/v1/investments/${id}/counterparties`,
    input
  );
}

export function listInvestmentDocuments(
  id: string,
  params?: QueryParams
): Promise<Page<Document>> {
  return apiGet<Page<Document>>(`/api/v1/investments/${id}/documents`, params);
}
