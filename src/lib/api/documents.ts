import { apiDownload, apiGet, apiJson, apiUpload, type QueryParams } from "./client";
import type { Document, DocumentUpdateInput, DocumentUploadInput, Page } from "./types";

export function listDocuments(params?: QueryParams): Promise<Page<Document>> {
  return apiGet<Page<Document>>("/api/v1/documents", params);
}

export function getDocument(id: string): Promise<Document> {
  return apiGet<Document>(`/api/v1/documents/${id}`);
}

export function updateDocument(id: string, input: DocumentUpdateInput): Promise<Document> {
  return apiJson<Document>("PATCH", `/api/v1/documents/${id}`, input);
}

function buildUploadFormData(input: DocumentUploadInput): FormData {
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("doc_type", input.doc_type);
  if (input.tax_year != null) formData.set("tax_year", String(input.tax_year));
  if (input.entity_id) formData.set("entity_id", input.entity_id);
  if (input.investment_id) formData.set("investment_id", input.investment_id);
  if (input.transaction_id) formData.set("transaction_id", input.transaction_id);
  if (input.notes) formData.set("notes", input.notes);
  return formData;
}

export function uploadDocument(input: DocumentUploadInput): Promise<Document> {
  return apiUpload<Document>("/api/v1/documents", buildUploadFormData(input));
}

export function uploadInvestmentDocument(
  investmentId: string,
  input: Omit<DocumentUploadInput, "entity_id" | "investment_id" | "transaction_id">
): Promise<Document> {
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("doc_type", input.doc_type);
  if (input.tax_year != null) formData.set("tax_year", String(input.tax_year));
  if (input.notes) formData.set("notes", input.notes);
  return apiUpload<Document>(`/api/v1/investments/${investmentId}/documents`, formData);
}

export function uploadEntityDocument(
  entityId: string,
  input: Omit<DocumentUploadInput, "entity_id" | "investment_id" | "transaction_id">
): Promise<Document> {
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("doc_type", input.doc_type);
  if (input.tax_year != null) formData.set("tax_year", String(input.tax_year));
  if (input.notes) formData.set("notes", input.notes);
  return apiUpload<Document>(`/api/v1/entities/${entityId}/documents`, formData);
}

export async function downloadDocument(id: string, filename: string): Promise<void> {
  const blob = await apiDownload(`/api/v1/documents/${id}/download`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
