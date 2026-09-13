"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { deleteCounterparty, getCounterparty, updateCounterparty } from "@/lib/api/counterparties";
import { useAuth } from "../../../providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labelize } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";

export default function CounterpartyDetailPage({
  params,
}: PageProps<"/counterparties/[id]">) {
  const { id } = use(params);
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const canDelete = user?.role === "admin";
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["counterparties", id],
    queryFn: () => getCounterparty(id),
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function startEditing() {
    if (!query.data) return;
    setName(query.data.name);
    setEmail(query.data.email ?? "");
    setPhone(query.data.phone ?? "");
    setEditing(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => updateCounterparty(id, { name, email: email || null, phone: phone || null }),
    onSuccess: () => {
      toast.success("Counterparty updated");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["counterparties", id] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCounterparty(id),
    onSuccess: () => {
      toast.success("Counterparty deleted");
      router.push("/counterparties");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (query.isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!query.data) return <p className="text-destructive">Counterparty not found.</p>;
  const counterparty = query.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{counterparty.name}</h1>
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Details</CardTitle>
          {canWrite && !editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd>{labelize(counterparty.counterparty_type)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{counterparty.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{counterparty.phone ?? "—"}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
