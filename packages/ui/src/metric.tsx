import type { ReactNode } from "react";

interface MetricProps {
  label: string;
  value: ReactNode;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="q-metric">
      <span className="q-metric__label">{label}</span>
      <strong className="q-metric__value">{value}</strong>
    </div>
  );
}
