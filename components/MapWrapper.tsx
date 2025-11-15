"use client";

import dynamic from "next/dynamic";
import type { MapProps } from "./Map";

const OsmMap = dynamic(() => import("./Map"), {
  ssr: false,
});

const MapWrapper = (props: MapProps) => {
  return <OsmMap {...props} />;
};

export default MapWrapper;
