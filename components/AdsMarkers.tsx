"use client";

import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { AdLocation } from "@/types/AdLocation";
import { AdMarker } from "./AdMarker";
import { pointInPolygon } from "@/utils/pointInPolygon";

const CLUSTER_ZOOM = 13;

type CityCluster = {
  key: string;
  count: number;
  center: [number, number];
  averagePrice: number;
  ads: AdLocation[];
};

// گروه‌بندی همه‌ی آگهی‌ها بر اساس شهر
function buildCityClusters(ads: AdLocation[]): CityCluster[] {
  const groups: Record<
    string,
    {
      count: number;
      latSum: number;
      lngSum: number;
      priceSum: number;
      ads: AdLocation[];
    }
  > = {};

  for (const ad of ads) {
    const cityKey = ad.city || "unknown";

    if (!groups[cityKey]) {
      groups[cityKey] = {
        count: 0,
        latSum: 0,
        lngSum: 0,
        priceSum: 0,
        ads: [],
      };
    }

    groups[cityKey].count += 1;
    groups[cityKey].latSum += ad.lat;
    groups[cityKey].lngSum += ad.lng;
    groups[cityKey].priceSum += ad.price;
    groups[cityKey].ads.push(ad);
  }

  return Object.entries(groups).map(([key, value]) => ({
    key,
    count: value.count,
    center: [value.latSum / value.count, value.lngSum / value.count],
    averagePrice: value.priceSum / value.count,
    ads: value.ads,
  }));
}

function groupNearbyAds(
  ads: AdLocation[],
  distanceThreshold: number = 0.01
): Array<{
  ads: AdLocation[];
  center: [number, number];
  averagePrice: number;
}> {
  const groups: Array<{
    ads: AdLocation[];
    latSum: number;
    lngSum: number;
    priceSum: number;
  }> = [];

  for (const ad of ads) {
    let addedToGroup = false;

    for (const group of groups) {
      const groupCenter = [
        group.latSum / group.ads.length,
        group.lngSum / group.ads.length,
      ];
      const distance = Math.sqrt(
        Math.pow(ad.lat - groupCenter[0], 2) +
          Math.pow(ad.lng - groupCenter[1], 2)
      );

      if (distance < distanceThreshold) {
        group.ads.push(ad);
        group.latSum += ad.lat;
        group.lngSum += ad.lng;
        group.priceSum += ad.price;
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push({
        ads: [ad],
        latSum: ad.lat,
        lngSum: ad.lng,
        priceSum: ad.price,
      });
    }
  }

  return groups.map((group) => ({
    ads: group.ads,
    center: [
      group.latSum / group.ads.length,
      group.lngSum / group.ads.length,
    ] as [number, number],
    averagePrice: group.priceSum / group.ads.length,
  }));
}

function createClusterIcon(count: number) {
  return L.divIcon({
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:48px;
        height:48px;
        border-radius:50%;
        background:#2563eb;
        color:white;
        font-size:14px;
        font-weight:bold;
        border:3px solid white;
        box-shadow:0 0 8px rgba(0,0,0,0.3);
      ">
        ${count}
      </div>
    `,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

interface AdsLayerProps {
  ads: AdLocation[];
  filterPolygon?: [number, number][];
  onMarkerClick?: (ads: AdLocation[]) => void;
}

export function AdsLayer({ ads, filterPolygon, onMarkerClick }: AdsLayerProps) {
  const [zoom, setZoom] = useState<number | null>(null);

  const map = useMapEvents({
    zoomend() {
      setZoom(map.getZoom());
    },
    load() {
      setZoom(map.getZoom());
    },
  });

  const filteredAds = filterPolygon
    ? ads.filter((ad) => pointInPolygon([ad.lat, ad.lng], filterPolygon))
    : ads;

  if (ads.length === 0 || zoom === null) return null;

  if (zoom < CLUSTER_ZOOM) {
    const cityClusters = buildCityClusters(filteredAds);

    return (
      <>
        {cityClusters.map((cluster) => (
          <Marker
            key={cluster.key}
            position={cluster.center}
            icon={createClusterIcon(cluster.count)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(cluster.ads);
                }
                map.flyTo(cluster.center, CLUSTER_ZOOM);
              },
            }}
          />
        ))}
      </>
    );
  }

  const nearbyGroups = groupNearbyAds(filteredAds);

  return (
    <>
      {nearbyGroups.map((group, index) => (
        <AdMarker
          key={`group-${index}`}
          ad={group.ads[0]}
          averagePrice={group.averagePrice}
          adsInGroup={group.ads}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </>
  );
}

export default AdsLayer;
