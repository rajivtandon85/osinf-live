interface AdSlotProps {
  label?: string;
  className?: string;
}

export function AdSlot({ label = "Ad Slot", className = "" }: AdSlotProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-2)] p-4 text-center ${className}`}
      role="complementary"
      aria-label={label}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Sponsored</p>
      <p className="mt-1 text-xs text-[var(--text)]/80">{label}</p>
    </div>
  );
}

