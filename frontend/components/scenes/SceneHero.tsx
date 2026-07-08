"use client";

import ArtelGlobe from "@/components/globe/ArtelGlobe";

export function SceneHero({ active }: { active: boolean }) {
  return (
    <div
      id="hero"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black ${active ? "is-active" : ""}`}
    >
      <ArtelGlobe />
    </div>
  );
}
