"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface InFeedAdProps {
  className?: string;
}

export function InFeedAd({ className = "" }: InFeedAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore ad push errors
    }
  }, []);

  return (
    <div className={`rounded-xl border border-[var(--line)] bg-[var(--panel)] p-2 ${className}`}>
      <p className="mb-2 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Sponsored</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-ef+6k-30-ac+ty"
        data-ad-client="ca-pub-3745035261365234"
        data-ad-slot="3583330437"
      />
    </div>
  );
}

