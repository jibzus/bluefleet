"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import type { PaymentHistoryRow } from "@/lib/validators/analytics";
import { formatCurrency } from "@/lib/validators/analytics";

interface PaymentHistoryTableProps {
  payments: PaymentHistoryRow[];
  currency: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  PROCESSING: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  FUNDED: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  RELEASED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  DISPUTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function PaymentHistoryTable({ payments, currency }: PaymentHistoryTableProps) {
  const [showAll, setShowAll] = useState(false);

  const visiblePayments = useMemo(() => (showAll ? payments : payments.slice(0, 8)), [payments, showAll]);

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Payment history</CardTitle>
      {payments.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
          No escrow transactions yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Vessel</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                  <th className="px-3 py-2 font-medium text-right">Fee</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/40 text-sm text-foreground last:border-0">
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 font-medium">{payment.vesselName}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {formatCurrency(payment.amount, currency)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                      {formatCurrency(payment.fee, currency)}
                    </td>
                    <td className="px-3 py-3 uppercase text-muted-foreground">{payment.provider}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[payment.status] || "bg-muted text-foreground"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length > 8 ? (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm font-medium text-primary transition hover:underline"
            >
              {showAll ? "Show less" : "View full history"}
            </button>
          ) : null}
        </div>
      )}
    </Card>
  );
}

