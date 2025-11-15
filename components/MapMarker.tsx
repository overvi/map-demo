import { LatLng } from "leaflet";
import React, { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

const MapMarker = () => {
  const [position, setPosition] = useState<null | LatLng>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Hello from OSM on Next.js!</Popup>
    </Marker>
  ) : null;
};

export default MapMarker;
