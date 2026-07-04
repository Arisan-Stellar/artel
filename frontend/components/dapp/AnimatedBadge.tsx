"use client";

import type { ReactNode } from "react";

export default function AnimatedBadge({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <div className="faucet-badge">
      {icon && <span className="mr-1">{icon}</span>}
      {text.split("").map((ch, i) => (
        <span key={i} className="fbox" data-alt={ch}
          style={ch === ">" ? { background: "var(--color-artel)", color: "#0a0a0a" } : {}}
        >{ch}</span>
      ))}
    </div>
  );
}
