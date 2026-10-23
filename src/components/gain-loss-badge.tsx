import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GainLossBadgeProps {
  /** Signed amount or percentage; sign determines gain/loss/flat. */
  value: number;
  /** Pre-formatted display text, e.g. "$1,234.56" or "+4.2%". Falls back to the raw value. */
  label?: string;
  className?: string;
}

/**
 * Color is never the only signal: an up/down/flat icon and a visible sign
 * always ship alongside it, per financial-UX accessibility conventions.
 */
export function GainLossBadge({ value, label, className }: GainLossBadgeProps) {
  const isGain = value > 0;
  const isLoss = value < 0;
  const Icon = isGain ? ArrowUp : isLoss ? ArrowDown : Minus;
  const text = label ?? value.toLocaleString();

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        isGain && "bg-gain/10 text-gain",
        isLoss && "bg-loss/10 text-loss",
        !isGain && !isLoss && "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {text}
    </span>
  );
}
