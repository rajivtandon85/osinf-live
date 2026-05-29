"use client";

import { useAdSlotState } from "./useAdSlotState";

interface InFeedAdProps {
  className?: string;
}

export function InFeedAd({ className = "" }: InFeedAdProps) {
  const { adRef, state } = useAdSlotState();
  const isFilled = state === "filled";
  const isUnfilled = state === "unfilled";

  return (
    <div
      className={`transition-all ${
        isFilled ? "rounded-xl border border-[var(--line)] bg-[var(--panel)] p-2" : "p-0"
      } ${isUnfilled ? "hidden" : ""} ${className}`}
    >
      {isFilled && (
        <p className="mb-2 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Sponsored
        </p>
      )}
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block", overflow: "hidden" }}
        data-ad-format="fluid"
        data-ad-layout-key="-ef+6k-30-ac+ty"
        data-ad-client="ca-pub-3745035261365234"
        data-ad-slot="3583330437"
      />
    </div>
  );
}
