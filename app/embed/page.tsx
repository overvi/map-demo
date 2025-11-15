import type { Metadata } from "next";
import MapWrapper from "@/components/MapWrapper";

export const metadata: Metadata = {
  title: "Map Embed",
  robots: { index: false, follow: false },
};

type Search = { [key: string]: string | string[] | undefined };

export default function EmbedPage({ searchParams }: { searchParams?: Search }) {
  const sp = searchParams || {};

  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const zoom = sp.zoom ? Number(sp.zoom) : undefined;
  // Show panel by default; allow disabling with panel=0/false
  const panel = sp.panel !== "0" && sp.panel !== "false";
  const draw = sp.draw !== "0" && sp.draw !== "false"; // default true

  const center =
    lat != null && lng != null && isFinite(lat) && isFinite(lng)
      ? ([lat, lng] as [number, number])
      : undefined;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapWrapper
        showSidePanel={panel}
        showDrawControl={draw}
        initialCenter={center}
        initialZoom={isFinite(zoom as number) ? (zoom as number) : undefined}
        bumpInitialZoom={true}
      />
    </div>
  );
}
