"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listInvestments } from "@/lib/api/investments";
import { listTransactions } from "@/lib/api/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { labelize } from "@/lib/api/types";

export default function DashboardPage() {
  const investmentsQuery = useQuery({
    queryKey: ["investments", "dashboard"],
    queryFn: () => listInvestments({ limit: 200 }),
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => listTransactions({ limit: 10 }),
  });

  const byAssetType = new Map<string, { count: number; total: number }>();
  for (const investment of investmentsQuery.data?.items ?? []) {
    const entry = byAssetType.get(investment.asset_type) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += investment.current_valuation ?? investment.initial_investment_amount;
    byAssetType.set(investment.asset_type, entry);
  }

  const totalValue = [...byAssetType.values()].reduce((sum, entry) => sum + entry.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {investmentsQuery.data?.total ?? "—"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio by Asset Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...byAssetType.entries()].map(([assetType, entry]) => (
                <TableRow key={assetType}>
                  <TableCell>{labelize(assetType)}</TableCell>
                  <TableCell>{entry.count}</TableCell>
                  <TableCell>{formatCurrency(entry.total)}</TableCell>
                </TableRow>
              ))}
              {byAssetType.size === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No investments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Investment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsQuery.data?.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{labelize(transaction.transaction_type)}</TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/investments/${transaction.investment_id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
