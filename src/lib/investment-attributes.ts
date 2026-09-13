import type { AssetType } from "@/lib/api/types";

export type AttributeFieldType = "string" | "number" | "boolean" | "date";

export interface AttributeField {
  name: string;
  label: string;
  type: AttributeFieldType;
}

export const ASSET_TYPE_ATTRIBUTE_FIELDS: Record<AssetType, AttributeField[]> = {
  private_stock: [
    { name: "company_name", label: "Company Name", type: "string" },
    { name: "share_class", label: "Share Class", type: "string" },
    { name: "num_shares", label: "Number of Shares", type: "number" },
    { name: "price_per_share", label: "Price per Share", type: "number" },
    { name: "round_name", label: "Round Name", type: "string" },
  ],
  safe_note: [
    { name: "valuation_cap", label: "Valuation Cap", type: "number" },
    { name: "discount_rate", label: "Discount Rate", type: "number" },
    { name: "is_post_money", label: "Post-Money", type: "boolean" },
  ],
  convertible_note: [
    { name: "principal_amount", label: "Principal Amount", type: "number" },
    { name: "interest_rate", label: "Interest Rate", type: "number" },
    { name: "maturity_date", label: "Maturity Date", type: "date" },
    { name: "valuation_cap", label: "Valuation Cap", type: "number" },
    { name: "discount_rate", label: "Discount Rate", type: "number" },
  ],
  real_property: [
    { name: "address", label: "Address", type: "string" },
    { name: "property_type", label: "Property Type", type: "string" },
    { name: "square_footage", label: "Square Footage", type: "number" },
    { name: "ownership_structure", label: "Ownership Structure", type: "string" },
  ],
  llc_interest: [
    { name: "llc_name", label: "LLC Name", type: "string" },
    { name: "units", label: "Units", type: "number" },
    { name: "operating_agreement_ref", label: "Operating Agreement Ref", type: "string" },
  ],
  pe_fund: [
    { name: "fund_name", label: "Fund Name", type: "string" },
    { name: "commitment_amount", label: "Commitment Amount", type: "number" },
    { name: "vintage_year", label: "Vintage Year", type: "number" },
    { name: "called_to_date", label: "Called to Date", type: "number" },
  ],
  vc_fund_lp: [
    { name: "fund_name", label: "Fund Name", type: "string" },
    { name: "commitment_amount", label: "Commitment Amount", type: "number" },
    { name: "vintage_year", label: "Vintage Year", type: "number" },
    { name: "called_to_date", label: "Called to Date", type: "number" },
  ],
  crypto: [
    { name: "ticker", label: "Ticker", type: "string" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "wallet_or_custodian", label: "Wallet / Custodian", type: "string" },
  ],
  artwork: [
    { name: "artist", label: "Artist", type: "string" },
    { name: "title", label: "Title", type: "string" },
    { name: "medium", label: "Medium", type: "string" },
    { name: "appraisal_source", label: "Appraisal Source", type: "string" },
  ],
  other: [],
};
