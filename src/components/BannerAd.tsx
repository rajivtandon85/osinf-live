"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function BannerAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore ad push errors
    }
  }, []);

  return (
    <div className="my-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-2">
      <p className="mb-2 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Sponsored</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3745035261365234"
        data-ad-slot="2442016457"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

