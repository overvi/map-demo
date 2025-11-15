"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

interface DrawingControlProps {
  onDrawComplete: (polygon: [number, number][]) => void;
  drawingEnabled: boolean;
  drawnPolygon?: [number, number][];
}

export function DrawingControl({
  onDrawComplete,
  drawingEnabled,
  drawnPolygon,
}: DrawingControlProps) {
  const map = useMap();
  const drawnLayerRef = useRef<L.FeatureGroup | null>(null);
  const polygonDrawerRef = useRef<L.Draw.Polygon | null>(null);
  const displayedPolygonRef = useRef<L.Polygon | null>(null);
  const onDrawCompleteRef = useRef(onDrawComplete);

  useEffect(() => {
    onDrawCompleteRef.current = onDrawComplete;
  }, [onDrawComplete]);

  useEffect(() => {
    if (!map) return;

    if (!drawnLayerRef.current) {
      const drawnLayer = new L.FeatureGroup();
      map.addLayer(drawnLayer);
      drawnLayerRef.current = drawnLayer;
    }

    const handleDrawCreated = (e: any) => {
      const layer = e.layer;

      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const polygon: [number, number][] = latlngs.map((ll) => [
          ll.lat,
          ll.lng,
        ]);
        map.removeLayer(layer);
        onDrawCompleteRef.current(polygon);
      }
    };

    map.on(L.Draw.Event.CREATED as any, handleDrawCreated);

    return () => {
      map.off(L.Draw.Event.CREATED as any, handleDrawCreated);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !drawnLayerRef.current) return;

    if (drawingEnabled) {
      if (polygonDrawerRef.current) {
        polygonDrawerRef.current.disable();
      }

      const polygonDrawer = new L.Draw.Polygon(map as any, {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.2,
        },
      });
      polygonDrawerRef.current = polygonDrawer;
      polygonDrawer.enable();
    } else {
      if (polygonDrawerRef.current) {
        polygonDrawerRef.current.disable();
        polygonDrawerRef.current = null;
      }
    }
  }, [drawingEnabled, map]);

  useEffect(() => {
    if (!map || !drawnLayerRef.current) return;

    if (!map.hasLayer(drawnLayerRef.current)) {
      map.addLayer(drawnLayerRef.current);
    }

    if (displayedPolygonRef.current) {
      if (drawnLayerRef.current.hasLayer(displayedPolygonRef.current)) {
        drawnLayerRef.current.removeLayer(displayedPolygonRef.current);
      }
      displayedPolygonRef.current = null;
    }

    if (drawnPolygon && drawnPolygon.length > 0) {
      const polygon = L.polygon(drawnPolygon as [number, number][], {
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.2,
        weight: 2,
      });
      drawnLayerRef.current.addLayer(polygon);
      displayedPolygonRef.current = polygon;
    }
  }, [drawnPolygon, map]);

  useEffect(() => {
    if (!map || !drawnLayerRef.current) return;

    const ensureVisibility = () => {
      const layer = drawnLayerRef.current;
      if (!layer) return;

      if (!map.hasLayer(layer)) {
        map.addLayer(layer);
      }

      if (
        displayedPolygonRef.current &&
        !layer.hasLayer(displayedPolygonRef.current)
      ) {
        layer.addLayer(displayedPolygonRef.current);
      }
    };

    const timeoutId = setTimeout(() => {
      ensureVisibility();
    }, 0);

    map.on("zoomend", ensureVisibility);
    map.on("moveend", ensureVisibility);
    map.on("viewreset", ensureVisibility);

    return () => {
      clearTimeout(timeoutId);
      map.off("zoomend", ensureVisibility);
      map.off("moveend", ensureVisibility);
      map.off("viewreset", ensureVisibility);
    };
  }, [map]);

  return null;
}
