"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotState = "loading" | "filled" | "unfilled";

export function useAdSlotState() {
  const adRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<AdSlotState>("loading");

  useEffect(() => {
    const adNode = adRef.current;
    if (!adNode) return;

    const syncState = () => {
      const status = adNode.getAttribute("data-ad-status");
      if (status === "filled" || adNode.querySelector("iframe")) {
        setState("filled");
        return;
      }
      if (status === "unfilled") {
        setState("unfilled");
      }
    };

    syncState();

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore ad push errors
    }

    const observer = new MutationObserver(syncState);
    observer.observe(adNode, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
      childList: true,
      subtree: true,
    });

    const timeout = window.setTimeout(() => {
      setState((current) => (current === "loading" ? "unfilled" : current));
    }, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  return { adRef, state };
}
