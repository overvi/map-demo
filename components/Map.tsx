"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import L from "leaflet";
import AdsLayer from "./AdsMarkers";
import { DrawingControl } from "./DrawingControl";
import { AdsPanel } from "./AdsPanel";
import { BottomPanel } from "./BottomPanel";
import { MdDraw } from "react-icons/md";
import type { AdLocation } from "@/types/AdLocation";
import { pointInPolygon } from "@/utils/pointInPolygon";

const defaultCenter: LatLngExpression = [48.8566, 2.3522];

const iranBounds: [[number, number], [number, number]] = [
  [24, 44],
  [40.5, 63.5],
];

function MapActions({
  polygon,
  drawingEnabled,
}: {
  polygon?: [number, number][];
  drawingEnabled: boolean;
}) {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    if (polygon && polygon.length > 0 && !hasZoomedRef.current) {
      const bounds = L.latLngBounds(polygon as [number, number][]);
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      hasZoomedRef.current = true;
    }

    if (!drawingEnabled && hasZoomedRef.current) {
      hasZoomedRef.current = false;
    }
  }, [polygon, drawingEnabled, map]);

  return null;
}

function ZoomTracker({
  onZoomChange,
  onBoundsChange,
  onMapReady,
}: {
  onZoomChange: (zoom: number) => void;
  onBoundsChange: (bounds: L.LatLngBounds | null) => void;
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
      setTimeout(() => {
        onBoundsChange(map.getBounds());
      }, 0);
    },
    moveend() {
      setTimeout(() => {
        onBoundsChange(map.getBounds());
      }, 0);
    },
    load() {
      onZoomChange(map.getZoom());
      setTimeout(() => {
        onBoundsChange(map.getBounds());
        onMapReady(map);
      }, 0);
    },
  });

  useEffect(() => {
    if (map) {
      onMapReady(map);
      const timeoutId = setTimeout(() => {
        onBoundsChange(map.getBounds());
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function InitialZoom() {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    if (!hasZoomedRef.current && map) {
      setTimeout(() => {
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom + 1, { animate: true });
        hasZoomedRef.current = true;
      }, 100);
    }
  }, [map]);

  return null;
}

export interface MapProps {
  showSidePanel?: boolean;
  showDrawControl?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
  bumpInitialZoom?: boolean;
}

export default function OsmMap({
  showSidePanel = true,
  showDrawControl = true,
  initialCenter,
  initialZoom,
  bumpInitialZoom = true,
}: MapProps) {
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<
    [number, number][] | undefined
  >();
  const [ads, setAds] = useState<AdLocation[]>([]);
  const [zoom, setZoom] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [selectedAds, setSelectedAds] = useState<AdLocation[] | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const handleZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds | null) => {
    setMapBounds(bounds);
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data: AdLocation[]) => setAds(data));
  }, []);

  const filteredAds = drawnPolygon
    ? ads.filter((ad) => pointInPolygon([ad.lat, ad.lng], drawnPolygon))
    : ads;

  const handleDrawComplete = useCallback((polygon: [number, number][]) => {
    setDrawnPolygon(polygon);
    setDrawingEnabled(false);
  }, []);

  const handleMarkerClick = useCallback((ads: AdLocation[]) => {
    setSelectedAds(ads);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (drawingEnabled) {
      setDrawingEnabled(false);
      setDrawnPolygon(undefined);
    } else {
      setDrawingEnabled(true);
      setDrawnPolygon(undefined);
    }
  }, [drawingEnabled]);

  const sidePanelWidth = 400;
  const mapWidth = showSidePanel
    ? `calc(100% - ${sidePanelWidth}px)`
    : "100%";

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={(initialCenter as LatLngExpression) || defaultCenter}
        zoom={initialZoom ?? 3}
        minZoom={6}
        maxBounds={iranBounds}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: mapWidth }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomTracker
          onZoomChange={handleZoomChange}
          onBoundsChange={handleBoundsChange}
          onMapReady={handleMapReady}
        />
        {bumpInitialZoom && <InitialZoom />}
        {showDrawControl && (
          <DrawingControl
            onDrawComplete={handleDrawComplete}
            drawingEnabled={drawingEnabled}
            drawnPolygon={drawnPolygon}
          />
        )}
        <MapActions polygon={drawnPolygon} drawingEnabled={drawingEnabled} />
        <AdsLayer
          ads={ads}
          filterPolygon={drawnPolygon}
          onMarkerClick={handleMarkerClick}
        />
      </MapContainer>
      {showSidePanel && (
        <AdsPanel
          ads={filteredAds}
          filterPolygon={drawnPolygon}
          zoom={zoom}
          mapBounds={mapBounds}
          onAdClick={(ad) => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([ad.lat, ad.lng], 14);
            }
          }}
        />
      )}
      {showDrawControl && (
        <button
        style={{
          position: "absolute",
          top: "10px",
          right: showSidePanel ? "410px" : "10px",
          zIndex: 1000,
          padding: "12px",
          backgroundColor: drawingEnabled ? "#dc2626" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "20px",
          fontWeight: "600",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleButtonClick}
        title={drawingEnabled ? "Cancel drawing" : "Draw area to filter ads"}
      >
        <MdDraw />
      </button>
      )}
      {drawnPolygon && (
        <button
          style={{
            position: "absolute",
            top: "60px",
            right: showSidePanel ? "410px" : "10px",
            zIndex: 1000,
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => {
            setDrawnPolygon(undefined);
          }}
          title="Clear filter"
        >
          Clear Filter
        </button>
      )}
      {selectedAds && (
        <BottomPanel
          ads={selectedAds}
          onClose={() => setSelectedAds(null)}
          onAdClick={(ad) => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([ad.lat, ad.lng], 15);
            }
          }}
          sidePanelRightOffset={showSidePanel ? 400 : 0}
        />
      )}
    </div>
  );
}
