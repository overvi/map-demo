"use client";

import type { AdLocation } from "@/types/AdLocation";
import type L from "leaflet";

interface AdsPanelProps {
  ads: AdLocation[];
  filterPolygon?: [number, number][];
  zoom: number | null;
  mapBounds: L.LatLngBounds | null;
  onAdClick: (ad: AdLocation) => void;
}

const CLUSTER_ZOOM = 13;

// Check if a point is within map bounds
function isInBounds(
  lat: number,
  lng: number,
  bounds: L.LatLngBounds | null
): boolean {
  if (!bounds) return true;
  return bounds.contains([lat, lng]);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(price);
}

function getCategoryLabel(category: AdLocation["category"]): string {
  const labels: Record<AdLocation["category"], string> = {
    apartment: "آپارتمان",
    shop: "مغازه",
    land: "زمین",
    office: "دفتر",
  };
  return labels[category] || category;
}

function getCategoryColor(category: AdLocation["category"]): string {
  const colors: Record<AdLocation["category"], string> = {
    apartment: "#3b82f6",
    shop: "#10b981",
    land: "#f59e0b",
    office: "#8b5cf6",
  };
  return colors[category] || "#6b7280";
}

export function AdsPanel({
  ads,
  filterPolygon,
  zoom,
  mapBounds,
  onAdClick,
}: AdsPanelProps) {
  if (zoom === null) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "400px",
          height: "100%",
          backgroundColor: "white",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
          zIndex: 1000,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  const isClustered = zoom < CLUSTER_ZOOM;

  // Filter ads based on zoom level:
  // - If zoomed out (clustered): show all ads
  // - If zoomed in: show only ads in visible bounds
  const displayAds = isClustered
    ? ads // Show all ads when zoomed out
    : ads.filter((ad) => isInBounds(ad.lat, ad.lng, mapBounds)); // Filter by bounds when zoomed in

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "400px",
        height: "100%",
        backgroundColor: "white",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          آگهی‌ها
        </h2>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          {isClustered
            ? `${ads.length} آگهی (همه آگهی‌ها)`
            : `${displayAds.length} آگهی ${
                filterPolygon ? "در محدوده انتخاب شده" : "در محدوده نمایش"
              }`}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px" }}>
        {displayAds.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6b7280",
            }}
          >
            <p>آگهی‌ای یافت نشد</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {displayAds.map((ad) => (
              <div
                key={ad.id}
                onClick={() => onAdClick(ad)}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: "white",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2563eb";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(37, 99, 235, 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <img
                  src={ad.image}
                  alt={ad.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#111827",
                        flex: 1,
                      }}
                    >
                      {ad.title}
                    </h3>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "white",
                        backgroundColor: getCategoryColor(ad.category),
                        whiteSpace: "nowrap",
                        marginRight: "8px",
                      }}
                    >
                      {getCategoryLabel(ad.category)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2563eb",
                      marginBottom: "8px",
                    }}
                  >
                    {formatPrice(ad.price)} تومان
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>📍</span>
                    <span>{ad.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
