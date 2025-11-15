"use client";

import dynamic from "next/dynamic";

const OsmMap = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const MapWrapper = () => {
  return <OsmMap />;
};

export default MapWrapper;
