import { apiGet, apiJson } from "./client";
import type { User } from "./types";

export function login(email: string, password: string): Promise<User> {
  return apiJson<User>("POST", "/api/v1/auth/login", { email, password });
}

export function logout(): Promise<void> {
  return apiJson<void>("POST", "/api/v1/auth/logout");
}

export function me(): Promise<User> {
  return apiGet<User>("/api/v1/auth/me");
}
