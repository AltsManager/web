"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createCounterparty, listCounterparties } from "@/lib/api/counterparties";
import { COUNTERPARTY_TYPES, labelize, type CounterpartyInput, type CounterpartyType } from "@/lib/api/types";
import { useAuth } from "../../providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { errorMessage } from "@/lib/format";

export default function CounterpartiesPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["counterparties"],
    queryFn: () => listCounterparties({ limit: 200 }),
  });

  const [form, setForm] = useState<CounterpartyInput>({
    name: "",
    counterparty_type: "fund_manager",
  });

  const createMutation = useMutation({
    mutationFn: (input: CounterpartyInput) => createCounterparty(input),
    onSuccess: () => {
      toast.success("Counterparty created");
      setForm({ name: "", counterparty_type: "fund_manager" });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Counterparties</h1>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle>New Counterparty</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
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
                <Label>Type</Label>
                <Select
                  value={form.counterparty_type}
                  onValueChange={(value) =>
                    setForm({ ...form, counterparty_type: value as CounterpartyType })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTERPARTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {labelize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((counterparty) => (
                <TableRow key={counterparty.id}>
                  <TableCell>
                    <Link
                      href={`/counterparties/${counterparty.id}`}
                      className="text-primary hover:underline"
                    >
                      {counterparty.name}
                    </Link>
                  </TableCell>
                  <TableCell>{labelize(counterparty.counterparty_type)}</TableCell>
                  <TableCell>{counterparty.email ?? "—"}</TableCell>
                </TableRow>
              ))}
              {(query.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No counterparties yet.
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
