"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listEntities } from "@/lib/api/entities";
import { listInvestments } from "@/lib/api/investments";
import { listTransactions, updateTransaction } from "@/lib/api/transactions";
import { TRANSACTION_TYPES, labelize, type TransactionType } from "@/lib/api/types";
import { useAuth } from "../../providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { errorMessage, formatCurrency, formatDate } from "@/lib/format";

export default function TransactionsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const queryClient = useQueryClient();

  const [entityId, setEntityId] = useState("all");
  const [investmentId, setInvestmentId] = useState("all");
  const [transactionType, setTransactionType] = useState<TransactionType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const entitiesQuery = useQuery({ queryKey: ["entities"], queryFn: () => listEntities({ limit: 200 }) });
  const investmentsQuery = useQuery({
    queryKey: ["investments"],
    queryFn: () => listInvestments({ limit: 200 }),
  });
  const query = useQuery({
    queryKey: ["transactions", entityId, investmentId, transactionType],
    queryFn: () =>
      listTransactions({
        limit: 200,
        entity_id: entityId === "all" ? undefined : entityId,
        investment_id: investmentId === "all" ? undefined : investmentId,
        transaction_type: transactionType === "all" ? undefined : transactionType,
      }),
  });

  const entities = entitiesQuery.data?.items ?? [];
  const investments = investmentsQuery.data?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateTransaction(id, { amount: Number(editAmount) }),
    onSuccess: () => {
      toast.success("Transaction updated");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Entity</Label>
          <Select value={entityId} onValueChange={setEntityId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Investment</Label>
          <Select value={investmentId} onValueChange={setInvestmentId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Investments</SelectItem>
              {investments.map((investment) => (
                <SelectItem key={investment.id} value={investment.id}>
                  {investment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={transactionType}
            onValueChange={(v) => setTransactionType(v as TransactionType | "all")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {labelize(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Investment</TableHead>
                <TableHead>Amount</TableHead>
                {canWrite && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{labelize(transaction.transaction_type)}</TableCell>
                  <TableCell>
                    {entities.find((e) => e.id === transaction.entity_id)?.name ??
                      transaction.entity_id}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/investments/${transaction.investment_id}`}
                      className="text-primary hover:underline"
                    >
                      {investments.find((i) => i.id === transaction.investment_id)?.name ??
                        "View"}
                    </a>
                  </TableCell>
                  <TableCell>
                    {editingId === transaction.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-28"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                        <Button size="sm" onClick={() => updateMutation.mutate(transaction.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      formatCurrency(transaction.amount, transaction.currency)
                    )}
                  </TableCell>
                  {canWrite && editingId !== transaction.id && (
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setEditingId(transaction.id);
                          setEditAmount(String(transaction.amount));
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(query.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions found.
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
