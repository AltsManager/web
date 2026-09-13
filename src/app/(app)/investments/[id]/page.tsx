"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { listCounterparties } from "@/lib/api/counterparties";
import { listEntities } from "@/lib/api/entities";
import { uploadInvestmentDocument, downloadDocument } from "@/lib/api/documents";
import {
  createInvestmentCounterparty,
  createInvestmentOwnership,
  createInvestmentTransaction,
  deleteInvestment,
  getInvestment,
  listInvestmentCounterparties,
  listInvestmentDocuments,
  listInvestmentOwnerships,
  listInvestmentTransactions,
  updateInvestment,
} from "@/lib/api/investments";
import {
  COUNTERPARTY_ROLES,
  DOCUMENT_TYPES,
  INVESTMENT_STATUSES,
  OWNERSHIP_TYPES,
  TRANSACTION_TYPES,
  labelize,
  type CounterpartyRole,
  type DocumentType,
  type InvestmentStatus,
  type OwnershipType,
  type TransactionType,
} from "@/lib/api/types";
import { TypeAttributesFields } from "@/components/type-attributes-fields";
import { useAuth } from "../../../providers";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, formatCurrency, formatDate } from "@/lib/format";

export default function InvestmentDetailPage({ params }: PageProps<"/investments/[id]">) {
  const { id } = use(params);
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === "staff";
  const canDelete = user?.role === "admin";
  const router = useRouter();
  const queryClient = useQueryClient();

  const investmentQuery = useQuery({
    queryKey: ["investments", id],
    queryFn: () => getInvestment(id),
  });
  const ownershipsQuery = useQuery({
    queryKey: ["investments", id, "ownerships"],
    queryFn: () => listInvestmentOwnerships(id),
  });
  const transactionsQuery = useQuery({
    queryKey: ["investments", id, "transactions"],
    queryFn: () => listInvestmentTransactions(id),
  });
  const documentsQuery = useQuery({
    queryKey: ["investments", id, "documents"],
    queryFn: () => listInvestmentDocuments(id),
  });
  const counterpartiesQuery = useQuery({
    queryKey: ["investments", id, "counterparties"],
    queryFn: () => listInvestmentCounterparties(id),
  });
  const entitiesQuery = useQuery({ queryKey: ["entities"], queryFn: () => listEntities({ limit: 200 }) });
  const allCounterpartiesQuery = useQuery({
    queryKey: ["counterparties"],
    queryFn: () => listCounterparties({ limit: 200 }),
  });

  const investment = investmentQuery.data;

  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<InvestmentStatus>("active");
  const [typeAttributes, setTypeAttributes] = useState<Record<string, unknown>>({});

  function startEditing() {
    if (!investment) return;
    setStatus(investment.status);
    setTypeAttributes(investment.type_attributes);
    setEditing(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => updateInvestment(id, { status, type_attributes: typeAttributes }),
    onSuccess: () => {
      toast.success("Investment updated");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["investments", id] });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvestment(id),
    onSuccess: () => {
      toast.success("Investment deleted");
      router.push("/investments");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // --- Ownership form ---
  const [ownershipEntityId, setOwnershipEntityId] = useState("");
  const [ownershipDate, setOwnershipDate] = useState(new Date().toISOString().slice(0, 10));
  const [ownershipPercentage, setOwnershipPercentage] = useState("");
  const [ownershipType, setOwnershipType] = useState<OwnershipType>("direct");

  const createOwnershipMutation = useMutation({
    mutationFn: () =>
      createInvestmentOwnership(id, {
        entity_id: ownershipEntityId,
        effective_date: ownershipDate,
        percentage: ownershipPercentage ? Number(ownershipPercentage) : undefined,
        ownership_type: ownershipType,
      }),
    onSuccess: () => {
      toast.success("Ownership added");
      setOwnershipEntityId("");
      setOwnershipPercentage("");
      queryClient.invalidateQueries({ queryKey: ["investments", id, "ownerships"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // --- Transaction form ---
  const [txEntityId, setTxEntityId] = useState("");
  const [txType, setTxType] = useState<TransactionType>("contribution");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txAmount, setTxAmount] = useState("");

  const createTransactionMutation = useMutation({
    mutationFn: () =>
      createInvestmentTransaction(id, {
        entity_id: txEntityId,
        transaction_type: txType,
        transaction_date: txDate,
        amount: Number(txAmount),
      }),
    onSuccess: () => {
      toast.success("Transaction added");
      setTxEntityId("");
      setTxAmount("");
      queryClient.invalidateQueries({ queryKey: ["investments", id, "transactions"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // --- Counterparty link form ---
  const [linkCounterpartyId, setLinkCounterpartyId] = useState("");
  const [linkRole, setLinkRole] = useState<CounterpartyRole>("fund_manager");

  const createCounterpartyLinkMutation = useMutation({
    mutationFn: () =>
      createInvestmentCounterparty(id, { counterparty_id: linkCounterpartyId, role: linkRole }),
    onSuccess: () => {
      toast.success("Counterparty linked");
      setLinkCounterpartyId("");
      queryClient.invalidateQueries({ queryKey: ["investments", id, "counterparties"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // --- Document upload form ---
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("statement");
  const [docNotes, setDocNotes] = useState("");

  const uploadDocumentMutation = useMutation({
    mutationFn: () => {
      if (!docFile) throw new Error("Select a file first");
      return uploadInvestmentDocument(id, { file: docFile, doc_type: docType, notes: docNotes });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setDocFile(null);
      setDocNotes("");
      queryClient.invalidateQueries({ queryKey: ["investments", id, "documents"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (investmentQuery.isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!investment) return <p className="text-destructive">Investment not found.</p>;

  const entities = entitiesQuery.data?.items ?? [];
  const allCounterparties = allCounterpartiesQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{investment.name}</h1>
          <p className="text-sm text-muted-foreground">{labelize(investment.asset_type)}</p>
        </div>
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
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as InvestmentStatus)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {labelize(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <TypeAttributesFields
                assetType={investment.asset_type}
                values={typeAttributes}
                onChange={setTypeAttributes}
              />
              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="secondary">{labelize(investment.status)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Acquisition Date</dt>
                <dd>{formatDate(investment.acquisition_date)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Initial Amount</dt>
                <dd>
                  {formatCurrency(investment.initial_investment_amount, investment.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current Valuation</dt>
                <dd>
                  {investment.current_valuation != null
                    ? formatCurrency(investment.current_valuation, investment.currency)
                    : "—"}
                </dd>
              </div>
              {Object.entries(investment.type_attributes).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-muted-foreground">{labelize(key)}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="ownerships">
        <TabsList>
          <TabsTrigger value="ownerships">Ownerships</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="counterparties">Counterparties</TabsTrigger>
        </TabsList>

        <TabsContent value="ownerships" className="space-y-4">
          {canWrite && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label>Entity</Label>
                    <Select value={ownershipEntityId} onValueChange={setOwnershipEntityId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={ownershipDate}
                      onChange={(e) => setOwnershipDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <Input
                      type="number"
                      value={ownershipPercentage}
                      onChange={(e) => setOwnershipPercentage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={ownershipType} onValueChange={(v) => setOwnershipType(v as OwnershipType)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNERSHIP_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {labelize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createOwnershipMutation.mutate()}
                    disabled={!ownershipEntityId || createOwnershipMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownershipsQuery.data?.items.map((ownership) => (
                <TableRow key={ownership.id}>
                  <TableCell>
                    {entities.find((e) => e.id === ownership.entity_id)?.name ?? ownership.entity_id}
                  </TableCell>
                  <TableCell>{formatDate(ownership.effective_date)}</TableCell>
                  <TableCell>{ownership.percentage ?? "—"}</TableCell>
                  <TableCell>{labelize(ownership.ownership_type)}</TableCell>
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
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {canWrite && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label>Entity</Label>
                    <Select value={txEntityId} onValueChange={setTxEntityId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={txType} onValueChange={(v) => setTxType(v as TransactionType)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {labelize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
                  </div>
                  <Button
                    onClick={() => createTransactionMutation.mutate()}
                    disabled={!txEntityId || !txAmount || createTransactionMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsQuery.data?.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{labelize(transaction.transaction_type)}</TableCell>
                  <TableCell>
                    {entities.find((e) => e.id === transaction.entity_id)?.name ??
                      transaction.entity_id}
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                </TableRow>
              ))}
              {(transactionsQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {canWrite && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label>File</Label>
                    <Input
                      type="file"
                      onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {labelize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => uploadDocumentMutation.mutate()}
                    disabled={!docFile || uploadDocumentMutation.isPending}
                  >
                    Upload
                  </Button>
                </div>
                <Textarea
                  placeholder="Notes"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsQuery.data?.items.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.filename}</TableCell>
                  <TableCell>{labelize(document.doc_type)}</TableCell>
                  <TableCell>{labelize(document.status)}</TableCell>
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
              {(documentsQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No documents yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="counterparties" className="space-y-4">
          {canWrite && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label>Counterparty</Label>
                    <Select value={linkCounterpartyId} onValueChange={setLinkCounterpartyId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select counterparty" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCounterparties.map((cp) => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={linkRole} onValueChange={(v) => setLinkRole(v as CounterpartyRole)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTERPARTY_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {labelize(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createCounterpartyLinkMutation.mutate()}
                    disabled={!linkCounterpartyId || createCounterpartyLinkMutation.isPending}
                  >
                    Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counterparty</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counterpartiesQuery.data?.items.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    {allCounterparties.find((c) => c.id === link.counterparty_id)?.name ??
                      link.counterparty_id}
                  </TableCell>
                  <TableCell>{labelize(link.role)}</TableCell>
                </TableRow>
              ))}
              {(counterpartiesQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No linked counterparties yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
