"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RentDatum {
  name: string;
  rent: number;
}

export function RentBudgetChart({
  data,
  budget,
}: {
  data: RentDatum[];
  budget: number;
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No data yet. Save some apartments to see how they stack up against your budget.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
          }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Rent"]}
        />
        {budget > 0 && (
          <ReferenceLine
            y={budget}
            stroke="var(--destructive)"
            strokeDasharray="4 4"
            label={{
              value: `Budget $${budget.toLocaleString()}`,
              fill: "var(--destructive)",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
        )}
        <Bar dataKey="rent" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={budget > 0 && d.rent > budget ? "var(--destructive)" : "var(--primary)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
