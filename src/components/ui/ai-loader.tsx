"use client";

import { cn } from "@/lib/utils";

export function AiLoader({
  label = "Generating",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex min-w-24 items-center justify-center pb-2",
        className,
      )}
      role="status"
      aria-label={label}
    >
      <span className="flex" aria-hidden="true">
        {Array.from(label).map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="ai-loader-letter inline-block text-sm font-medium text-zinc-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="ai-loader-bar absolute bottom-0 left-1/2 h-0.5 w-full -translate-x-1/2 overflow-hidden rounded-full bg-white/15"
      />
    </span>
  );
}
