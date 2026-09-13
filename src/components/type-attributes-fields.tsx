"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType } from "@/lib/api/types";
import { ASSET_TYPE_ATTRIBUTE_FIELDS } from "@/lib/investment-attributes";

interface Props {
  assetType: AssetType;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function TypeAttributesFields({ assetType, values, onChange }: Props) {
  const fields = ASSET_TYPE_ATTRIBUTE_FIELDS[assetType];

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No structured fields for this asset type. Use Notes for additional detail.
      </p>
    );
  }

  function setField(name: string, value: unknown) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div className="flex flex-wrap gap-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={`attr-${field.name}`}>{field.label}</Label>
          {field.type === "boolean" ? (
            <Select
              value={values[field.name] === true ? "true" : "false"}
              onValueChange={(value) => setField(field.name, value === "true")}
            >
              <SelectTrigger id={`attr-${field.name}`} className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`attr-${field.name}`}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={(values[field.name] as string | number | undefined) ?? ""}
              onChange={(event) =>
                setField(
                  field.name,
                  field.type === "number"
                    ? event.target.value === ""
                      ? undefined
                      : Number(event.target.value)
                    : event.target.value
                )
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
