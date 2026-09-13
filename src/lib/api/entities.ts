import { apiGet, apiJson, type QueryParams } from "./client";
import type { Document, Entity, EntityInput, Ownership, Page } from "./types";

export function listEntities(params?: QueryParams): Promise<Page<Entity>> {
  return apiGet<Page<Entity>>("/api/v1/entities", params);
}

export function getEntity(id: string): Promise<Entity> {
  return apiGet<Entity>(`/api/v1/entities/${id}`);
}

export function createEntity(input: EntityInput): Promise<Entity> {
  return apiJson<Entity>("POST", "/api/v1/entities", input);
}

export function updateEntity(id: string, input: Partial<EntityInput>): Promise<Entity> {
  return apiJson<Entity>("PATCH", `/api/v1/entities/${id}`, input);
}

export function deleteEntity(id: string): Promise<void> {
  return apiJson<void>("DELETE", `/api/v1/entities/${id}`);
}

export function listEntityOwnerships(id: string, params?: QueryParams): Promise<Page<Ownership>> {
  return apiGet<Page<Ownership>>(`/api/v1/entities/${id}/ownerships`, params);
}

export function listEntityDocuments(id: string, params?: QueryParams): Promise<Page<Document>> {
  return apiGet<Page<Document>>(`/api/v1/entities/${id}/documents`, params);
}
