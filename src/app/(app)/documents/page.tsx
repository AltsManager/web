"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listEntities } from "@/lib/api/entities";
import { downloadDocument, listDocuments, updateDocument, uploadDocument } from "@/lib/api/documents";
import { listInvestments } from "@/lib/api/investments";
import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  labelize,
  type DocumentStatus,
  type DocumentType,
} from "@/lib/api/types";

// The warning token itself is sub-3:1 contrast as text on a light surface by
// design (per the dataviz skill's status palette) -- it's meant to be paired
// with an icon, not used as plain text color. Use readable amber shades here
// instead of the raw token for a text-only badge.
const DOCUMENT_STATUS_BADGE_CLASS: Record<DocumentStatus, string> = {
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  reviewed: "bg-muted text-muted-foreground",
  approved: "bg-gain/10 text-gain",
  archived: "bg-muted text-muted-foreground",
};
import { useAuth } from "../../providers";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, formatDate } from "@/lib/format";

export default function DocumentsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const queryClient = useQueryClient();

  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");

  const entitiesQuery = useQuery({ queryKey: ["entities"], queryFn: () => listEntities({ limit: 200 }) });
  const investmentsQuery = useQuery({
    queryKey: ["investments"],
    queryFn: () => listInvestments({ limit: 200 }),
  });
  const query = useQuery({
    queryKey: ["documents", docTypeFilter, statusFilter],
    queryFn: () =>
      listDocuments({
        limit: 200,
        doc_type: docTypeFilter === "all" ? undefined : docTypeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const entities = entitiesQuery.data?.items ?? [];
  const investments = investmentsQuery.data?.items ?? [];

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("k1");
  const [taxYear, setTaxYear] = useState("");
  const [entityId, setEntityId] = useState("none");
  const [investmentId, setInvestmentId] = useState("none");
  const [notes, setNotes] = useState("");

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Select a file first");
      if (entityId === "none" && investmentId === "none") {
        throw new Error("Select an entity or investment to link this document to");
      }
      return uploadDocument({
        file,
        doc_type: docType,
        tax_year: taxYear ? Number(taxYear) : undefined,
        entity_id: entityId === "none" ? undefined : entityId,
        investment_id: investmentId === "none" ? undefined : investmentId,
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setFile(null);
      setTaxYear("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocumentStatus }) =>
      updateDocument(id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Documents</h1>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {labelize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Year</Label>
                <Input
                  type="number"
                  className="w-28"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Entity</Label>
                <Select value={entityId} onValueChange={setEntityId}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
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
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {investments.map((investment) => (
                      <SelectItem key={investment.id} value={investment.id}>
                        {investment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={() => uploadMutation.mutate()} disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Select value={docTypeFilter} onValueChange={(v) => setDocTypeFilter(v as DocumentType | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {labelize(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DocumentStatus | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {DOCUMENT_STATUSES.map((status) => (
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
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.filename}</TableCell>
                  <TableCell>{labelize(document.doc_type)}</TableCell>
                  <TableCell>{document.tax_year ?? "—"}</TableCell>
                  <TableCell>
                    {canWrite ? (
                      <Select
                        value={document.status}
                        onValueChange={(value) =>
                          statusMutation.mutate({ id: document.id, status: value as DocumentStatus })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {labelize(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={DOCUMENT_STATUS_BADGE_CLASS[document.status]}>
                        {labelize(document.status)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(document.uploaded_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => downloadDocument(document.id, document.filename)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(query.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No documents found.
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
