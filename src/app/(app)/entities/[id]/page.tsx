"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import {
  deleteEntity,
  getEntity,
  listEntityDocuments,
  listEntityOwnerships,
  updateEntity,
} from "@/lib/api/entities";
import { ENTITY_TYPES, labelize, type EntityType } from "@/lib/api/types";
import { useAuth } from "../../../providers";
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
import { errorMessage, formatDate } from "@/lib/format";

export default function EntityDetailPage({ params }: PageProps<"/entities/[id]">) {
  const { id } = use(params);
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const canDelete = user?.role === "admin";
  const router = useRouter();
  const queryClient = useQueryClient();

  const entityQuery = useQuery({ queryKey: ["entities", id], queryFn: () => getEntity(id) });
  const ownershipsQuery = useQuery({
    queryKey: ["entities", id, "ownerships"],
    queryFn: () => listEntityOwnerships(id),
  });
  const documentsQuery = useQuery({
    queryKey: ["entities", id, "documents"],
    queryFn: () => listEntityDocuments(id),
  });

  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("llc");
  const [editing, setEditing] = useState(false);

  const entity = entityQuery.data;

  function startEditing() {
    if (!entity) return;
    setName(entity.name);
    setEntityType(entity.entity_type);
    setEditing(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => updateEntity(id, { name, entity_type: entityType }),
    onSuccess: () => {
      toast.success("Entity updated");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["entities", id] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEntity(id),
    onSuccess: () => {
      toast.success("Entity deleted");
      router.push("/entities");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (entityQuery.isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!entity) return <p className="text-destructive">Entity not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{entity.name}</h1>
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
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {labelize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <dd>{labelize(entity.entity_type)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tax ID</dt>
                <dd>{entity.tax_id ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jurisdiction</dt>
                <dd>{entity.jurisdiction ?? "—"}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ownerships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investment</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="text-right">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownershipsQuery.data?.items.map((ownership) => (
                <TableRow key={ownership.id}>
                  <TableCell>
                    <a
                      href={`/investments/${ownership.investment_id}`}
                      className="text-primary hover:underline"
                    >
                      View investment
                    </a>
                  </TableCell>
                  <TableCell>{formatDate(ownership.effective_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {ownership.percentage != null ? `${ownership.percentage}%` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {ownership.units ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {(ownershipsQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No ownerships yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsQuery.data?.items.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.filename}</TableCell>
                  <TableCell>{labelize(document.doc_type)}</TableCell>
                  <TableCell>{labelize(document.status)}</TableCell>
                </TableRow>
              ))}
              {(documentsQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No documents yet.
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
