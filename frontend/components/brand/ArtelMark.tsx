"use client";

import { useId } from "react";

/**
 * The ARTEL brand mark - a warm golden drop/seed shape representing the
 * arisan pool. Inlined SVG so it stays crisp; the gradient id is unique
 * per instance (useId) so multiple marks on one page don't collide.
 */
export function ArtelMark({
  className,
  withPlate = false,
}: {
  className?: string;
  withPlate?: boolean;
}) {
  const id = useId();
  const gid = `artel-grad-${id}`;
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="ARTEL">
      {withPlate && <rect width="512" height="512" rx="128" fill="#05111F" />}
      <path
        d="M256 72C304 140 376 203 376 294C376 363 322 416 256 416C190 416 136 363 136 294C136 203 208 140 256 72Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M189 299C215 329 295 329 323 299"
        stroke="#F7F0DF"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M207 250H305" stroke="#05111F" strokeWidth="24" strokeLinecap="round" />
      <defs>
        <linearGradient id={gid} x1="136" y1="92" x2="389" y2="401" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" />
          <stop offset="0.52" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
