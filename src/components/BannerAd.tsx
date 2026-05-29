"use client";

import { useAdSlotState } from "./useAdSlotState";

export function BannerAd() {
  const { adRef, state } = useAdSlotState();
  const isFilled = state === "filled";
  const isUnfilled = state === "unfilled";

  return (
    <div
      className={`my-4 transition-all ${
        isFilled ? "rounded-xl border border-[var(--line)] bg-[var(--panel)] p-2" : "p-0"
      } ${isUnfilled ? "hidden" : ""}`}
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
        data-ad-client="ca-pub-3745035261365234"
        data-ad-slot="2442016457"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
