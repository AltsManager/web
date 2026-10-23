"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { GainLossBadge } from "@/components/gain-loss-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { labelize, type AssetType } from "@/lib/api/types";

// The 8-slot categorical theme from the dataviz skill's validated default
// palette (references/palette.md) -- used as-is, in this order.
const CATEGORICAL = [
  "var(--chart-1)", // blue
  "var(--chart-2)", // orange
  "var(--chart-3)", // aqua
  "var(--chart-4)", // yellow
  "var(--chart-5)", // magenta
  "#008300", // green
  "#6250d6", // violet
  "#e34948", // red
];
const MAX_CATEGORICAL_SLOTS = CATEGORICAL.length;

const INFLOW_TYPES = new Set(["contribution", "capital_call", "purchase"]);
const OUTFLOW_TYPES = new Set(["distribution", "sale"]);

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; payload?: { fullLabel?: string } }[];
  label?: string;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-popover-foreground">
        {payload[0].payload?.fullLabel ?? label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="text-muted-foreground">
          {entry.name ? `${entry.name}: ` : ""}
          {valueFormatter(entry.value)}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const investmentsQuery = useQuery({
    queryKey: ["investments", "dashboard"],
    queryFn: () => listInvestments({ limit: 500 }),
  });
  const allTransactionsQuery = useQuery({
    queryKey: ["transactions", "all-for-chart"],
    queryFn: () => listTransactions({ limit: 1000 }),
  });
  const recentTransactionsQuery = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => listTransactions({ limit: 10 }),
  });

  const investments = useMemo(
    () => investmentsQuery.data?.items ?? [],
    [investmentsQuery.data]
  );

  const totals = useMemo(() => {
    let investedCapital = 0;
    let currentValue = 0;
    let hasValuations = false;
    for (const investment of investments) {
      investedCapital += investment.initial_investment_amount;
      if (investment.current_valuation != null) {
        currentValue += investment.current_valuation;
        hasValuations = true;
      } else {
        currentValue += investment.initial_investment_amount;
      }
    }
    return {
      investedCapital,
      currentValue,
      unrealizedGainLoss: hasValuations ? currentValue - investedCapital : 0,
      hasValuations,
    };
  }, [investments]);

  const byAssetType = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const investment of investments) {
      const entry = map.get(investment.asset_type) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += investment.current_valuation ?? investment.initial_investment_amount;
      map.set(investment.asset_type, entry);
    }
    return map;
  }, [investments]);

  const allocationData = useMemo(() => {
    const entries = [...byAssetType.entries()]
      .map(([assetType, entry]) => ({ assetType, ...entry }))
      .sort((a, b) => b.total - a.total);

    if (entries.length <= MAX_CATEGORICAL_SLOTS) return entries;

    const kept = entries.slice(0, MAX_CATEGORICAL_SLOTS - 1);
    const rest = entries.slice(MAX_CATEGORICAL_SLOTS - 1);
    const other = rest.reduce(
      (acc, e) => ({ count: acc.count + e.count, total: acc.total + e.total }),
      { count: 0, total: 0 }
    );
    return [...kept, { assetType: "other" as AssetType, ...other }];
  }, [byAssetType]);

  const investedCapitalSeries = useMemo(() => {
    const transactions = allTransactionsQuery.data?.items ?? [];
    const byDay = new Map<string, number>();
    for (const tx of transactions) {
      const day = tx.transaction_date.slice(0, 10);
      let delta = 0;
      if (INFLOW_TYPES.has(tx.transaction_type)) delta = tx.amount;
      else if (OUTFLOW_TYPES.has(tx.transaction_type)) delta = -tx.amount;
      else continue;
      byDay.set(day, (byDay.get(day) ?? 0) + delta);
    }
    const days = [...byDay.keys()].sort();
    return days.reduce<{ day: string; value: number; fullLabel: string }[]>((acc, day) => {
      const previous = acc.length > 0 ? acc[acc.length - 1].value : 0;
      const value = previous + (byDay.get(day) ?? 0);
      acc.push({
        day,
        value,
        fullLabel: new Date(day).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      });
      return acc;
    }, []);
  }, [allTransactionsQuery.data]);

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
          <CardContent className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totals.currentValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invested Capital
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totals.investedCapital)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unrealized Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
            {totals.hasValuations ? (
              <GainLossBadge
                value={totals.unrealizedGainLoss}
                label={formatCurrency(totals.unrealizedGainLoss)}
                className="text-base"
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {investmentsQuery.data?.total ?? "—"}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invested Capital Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {investedCapitalSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={investedCapitalSeries}>
                  <defs>
                    <linearGradient id="investedCapitalFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d: string) =>
                      new Date(d).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
                    }
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, "")}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    content={<CustomTooltip valueFormatter={(v) => formatCurrency(v)} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#investedCapitalFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Not enough transaction history yet to chart.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation by Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={allocationData.map((e) => ({ ...e, label: labelize(e.assetType) }))}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, "")}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    content={<CustomTooltip valueFormatter={(v) => formatCurrency(v)} />}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar dataKey="total" radius={4} barSize={16}>
                    {allocationData.map((entry, i) => (
                      <Cell key={entry.assetType} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No investments yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table view of the allocation chart above -- accessibility fallback, not decorative. */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio by Asset Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocationData.map((entry) => (
                <TableRow key={entry.assetType}>
                  <TableCell>{labelize(entry.assetType)}</TableCell>
                  <TableCell className="text-right tabular-nums">{entry.count}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(entry.total)}
                  </TableCell>
                </TableRow>
              ))}
              {allocationData.length === 0 && (
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
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Investment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactionsQuery.data?.items.map((transaction) => {
                const isOutflow = OUTFLOW_TYPES.has(transaction.transaction_type);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell>{labelize(transaction.transaction_type)}</TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${isOutflow ? "text-loss" : ""}`}
                    >
                      {isOutflow ? "−" : ""}
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
                );
              })}
              {(recentTransactionsQuery.data?.items.length ?? 0) === 0 && (
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
