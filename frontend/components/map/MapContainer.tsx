"use client";

import dynamic from "next/dynamic";

const DottedMap = dynamic(() => import("./DottedMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] bg-swiss-muted animate-pulse border-4 border-swiss-fg" />
  ),
});

export default function MapContainer() {
  return <DottedMap />;
}
