"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number | null;
  isSearching: boolean;
}

export function SearchBar({ value, onChange, resultCount, isSearching }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocalValue(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(v);
    }, 350);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut: / to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        handleClear();
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isSearching ? (
          <span className="animate-spin text-xs text-white/30">↻</span>
        ) : (
          <svg
            className="h-3.5 w-3.5 text-white/25"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='Search feeds… e.g. "Iran war", "ransomware", "Israel"'
        className="w-full rounded-lg bg-white/[0.03] py-2.5 pl-9 pr-20 text-sm text-white/80 placeholder-white/20 ring-1 ring-white/8 outline-none transition focus:bg-white/[0.05] focus:ring-white/20"
      />

      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
        {resultCount !== null && localValue.trim() && (
          <span className="text-[11px] text-white/25">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
        {localValue && (
          <button
            onClick={handleClear}
            className="rounded p-0.5 text-white/25 transition hover:bg-white/5 hover:text-white/60"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {!localValue && (
          <kbd className="hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/20 ring-1 ring-white/10 sm:inline-block">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
