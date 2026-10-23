"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createInvestment, listInvestments } from "@/lib/api/investments";
import {
  ASSET_TYPES,
  INVESTMENT_STATUS_BADGE_CLASS,
  INVESTMENT_STATUSES,
  labelize,
  type AssetType,
  type InvestmentInput,
  type InvestmentStatus,
} from "@/lib/api/types";
import { TypeAttributesFields } from "@/components/type-attributes-fields";
import { useAuth } from "../../providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GainLossBadge } from "@/components/gain-loss-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorMessage, formatCurrency } from "@/lib/format";

const emptyForm: InvestmentInput = {
  name: "",
  asset_type: "safe_note",
  acquisition_date: new Date().toISOString().slice(0, 10),
  initial_investment_amount: 0,
  type_attributes: {},
};

export default function InvestmentsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const queryClient = useQueryClient();

  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: ["investments", assetTypeFilter, statusFilter],
    queryFn: () => listInvestments({ limit: 200 }),
  });

  const items = (query.data?.items ?? []).filter(
    (investment) =>
      (assetTypeFilter === "all" || investment.asset_type === assetTypeFilter) &&
      (statusFilter === "all" || investment.status === statusFilter)
  );

  const [form, setForm] = useState<InvestmentInput>(emptyForm);

  const createMutation = useMutation({
    mutationFn: (input: InvestmentInput) => createInvestment(input),
    onSuccess: () => {
      toast.success("Investment created");
      setForm(emptyForm);
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Investments</h1>
        {canWrite && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" />
                New Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Investment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select
                      value={form.asset_type}
                      onValueChange={(value) =>
                        setForm({ ...form, asset_type: value as AssetType, type_attributes: {} })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {labelize(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acquisition_date">Acquisition Date</Label>
                    <Input
                      id="acquisition_date"
                      type="date"
                      required
                      value={form.acquisition_date}
                      onChange={(event) =>
                        setForm({ ...form, acquisition_date: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Initial Investment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      required
                      value={form.initial_investment_amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          initial_investment_amount: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <TypeAttributesFields
                  assetType={form.asset_type}
                  values={form.type_attributes ?? {}}
                  onChange={(values) => setForm({ ...form, type_attributes: values })}
                />

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4">
        <Select value={assetTypeFilter} onValueChange={(v) => setAssetTypeFilter(v as AssetType | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All asset types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Asset Types</SelectItem>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {labelize(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvestmentStatus | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {INVESTMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {labelize(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Unrealized Gain/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((investment) => {
                const gainLoss =
                  investment.current_valuation != null
                    ? investment.current_valuation - investment.initial_investment_amount
                    : null;
                return (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <Link
                        href={`/investments/${investment.id}`}
                        className="text-primary hover:underline"
                      >
                        {investment.name}
                      </Link>
                    </TableCell>
                    <TableCell>{labelize(investment.asset_type)}</TableCell>
                    <TableCell>
                      <Badge className={INVESTMENT_STATUS_BADGE_CLASS[investment.status]}>
                        {labelize(investment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(investment.initial_investment_amount, investment.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {gainLoss != null ? (
                        <GainLossBadge
                          value={gainLoss}
                          label={formatCurrency(gainLoss, investment.currency)}
                          className="ml-auto"
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No investments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
