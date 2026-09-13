export type UserRole = "admin" | "staff" | "viewer";

export type EntityType =
  | "individual"
  | "trust"
  | "llc"
  | "partnership"
  | "corporation"
  | "joint";

export type CounterpartyType =
  | "individual"
  | "law_firm"
  | "accounting_firm"
  | "fund_manager"
  | "sponsor"
  | "broker"
  | "other";

export type CounterpartyRole =
  | "fund_manager"
  | "sponsor"
  | "legal_counsel"
  | "accountant"
  | "auditor"
  | "broker"
  | "other";

export type AssetType =
  | "private_stock"
  | "safe_note"
  | "convertible_note"
  | "real_property"
  | "llc_interest"
  | "pe_fund"
  | "vc_fund_lp"
  | "crypto"
  | "artwork"
  | "other";

export type InvestmentStatus = "active" | "exited" | "written_off";

export type ValuationSource = "manual" | "third_party" | "mark";

export type OwnershipType = "direct" | "indirect";

export type TransactionType =
  | "capital_call"
  | "contribution"
  | "distribution"
  | "purchase"
  | "sale"
  | "valuation_update"
  | "fee"
  | "transfer";

export type DocumentType =
  | "k1"
  | "subscription_agreement"
  | "safe_note"
  | "operating_agreement"
  | "capital_call_notice"
  | "statement"
  | "tax_form"
  | "valuation_report"
  | "other";

export type DocumentStatus = "pending_review" | "reviewed" | "approved" | "archived";

export const ENTITY_TYPES: EntityType[] = [
  "individual",
  "trust",
  "llc",
  "partnership",
  "corporation",
  "joint",
];

export const COUNTERPARTY_TYPES: CounterpartyType[] = [
  "individual",
  "law_firm",
  "accounting_firm",
  "fund_manager",
  "sponsor",
  "broker",
  "other",
];

export const COUNTERPARTY_ROLES: CounterpartyRole[] = [
  "fund_manager",
  "sponsor",
  "legal_counsel",
  "accountant",
  "auditor",
  "broker",
  "other",
];

export const ASSET_TYPES: AssetType[] = [
  "private_stock",
  "safe_note",
  "convertible_note",
  "real_property",
  "llc_interest",
  "pe_fund",
  "vc_fund_lp",
  "crypto",
  "artwork",
  "other",
];

export const INVESTMENT_STATUSES: InvestmentStatus[] = ["active", "exited", "written_off"];

export const VALUATION_SOURCES: ValuationSource[] = ["manual", "third_party", "mark"];

export const OWNERSHIP_TYPES: OwnershipType[] = ["direct", "indirect"];

export const TRANSACTION_TYPES: TransactionType[] = [
  "capital_call",
  "contribution",
  "distribution",
  "purchase",
  "sale",
  "valuation_update",
  "fee",
  "transfer",
];

export const DOCUMENT_TYPES: DocumentType[] = [
  "k1",
  "subscription_agreement",
  "safe_note",
  "operating_agreement",
  "capital_call_notice",
  "statement",
  "tax_form",
  "valuation_report",
  "other",
];

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  "pending_review",
  "reviewed",
  "approved",
  "archived",
];

export function labelize(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Entity {
  id: string;
  name: string;
  entity_type: EntityType;
  tax_id: string | null;
  formation_date: string | null;
  jurisdiction: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EntityInput {
  name: string;
  entity_type: EntityType;
  tax_id?: string | null;
  formation_date?: string | null;
  jurisdiction?: string | null;
  notes?: string | null;
}

export interface Counterparty {
  id: string;
  name: string;
  counterparty_type: CounterpartyType;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CounterpartyInput {
  name: string;
  counterparty_type: CounterpartyType;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface Investment {
  id: string;
  name: string;
  asset_type: AssetType;
  status: InvestmentStatus;
  acquisition_date: string;
  initial_investment_amount: number;
  currency: string;
  current_valuation: number | null;
  valuation_date: string | null;
  valuation_source: ValuationSource | null;
  type_attributes: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentInput {
  name: string;
  asset_type: AssetType;
  status?: InvestmentStatus;
  acquisition_date: string;
  initial_investment_amount: number;
  currency?: string;
  current_valuation?: number | null;
  valuation_date?: string | null;
  valuation_source?: ValuationSource | null;
  type_attributes?: Record<string, unknown>;
  notes?: string | null;
}

export interface Ownership {
  id: string;
  entity_id: string;
  investment_id: string;
  effective_date: string;
  end_date: string | null;
  percentage: number | null;
  units: number | null;
  ownership_type: OwnershipType;
  notes: string | null;
}

export interface OwnershipInput {
  entity_id: string;
  effective_date: string;
  end_date?: string | null;
  percentage?: number | null;
  units?: number | null;
  ownership_type?: OwnershipType;
  notes?: string | null;
}

export interface Transaction {
  id: string;
  investment_id: string;
  entity_id: string;
  transaction_type: TransactionType;
  transaction_date: string;
  amount: number;
  currency: string;
  units_delta: number | null;
  price_per_unit: number | null;
  counterparty_id: string | null;
  document_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  entity_id: string;
  transaction_type: TransactionType;
  transaction_date: string;
  amount: number;
  currency?: string;
  units_delta?: number | null;
  price_per_unit?: number | null;
  counterparty_id?: string | null;
  document_id?: string | null;
  notes?: string | null;
}

export interface TransactionUpdateInput {
  transaction_type?: TransactionType;
  transaction_date?: string;
  amount?: number;
  currency?: string;
  units_delta?: number | null;
  price_per_unit?: number | null;
  counterparty_id?: string | null;
  document_id?: string | null;
  notes?: string | null;
}

export interface InvestmentCounterparty {
  id: string;
  investment_id: string;
  counterparty_id: string;
  role: CounterpartyRole;
  notes: string | null;
}

export interface InvestmentCounterpartyInput {
  counterparty_id: string;
  role: CounterpartyRole;
  notes?: string | null;
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  doc_type: DocumentType;
  tax_year: number | null;
  status: DocumentStatus;
  entity_id: string | null;
  investment_id: string | null;
  transaction_id: string | null;
  uploaded_by: string;
  uploaded_at: string;
  notes: string | null;
}

export interface DocumentUpdateInput {
  doc_type?: DocumentType;
  tax_year?: number | null;
  status?: DocumentStatus;
  notes?: string | null;
}

export interface DocumentUploadInput {
  file: File;
  doc_type: DocumentType;
  tax_year?: number | null;
  entity_id?: string | null;
  investment_id?: string | null;
  transaction_id?: string | null;
  notes?: string | null;
}
