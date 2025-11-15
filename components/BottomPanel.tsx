"use client";

import type { AdLocation } from "@/types/AdLocation";
import { MdClose } from "react-icons/md";

interface BottomPanelProps {
  ads: AdLocation[];
  onClose: () => void;
  onAdClick: (ad: AdLocation) => void;
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

export function BottomPanel({ ads, onClose, onAdClick }: BottomPanelProps) {
  if (ads.length === 0) return null;

  const averagePrice = ads.reduce((sum, ad) => sum + ad.price, 0) / ads.length;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: "400px",
        height: "400px",
        backgroundColor: "white",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            آگهی‌های این منطقه
          </h3>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            {ads.length} آگهی • میانگین قیمت:{" "}
            {formatPrice(Math.round(averagePrice))} تومان
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <MdClose size={24} />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ads.map((ad) => (
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
                display: "flex",
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
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ padding: "16px", flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      flex: 1,
                    }}
                  >
                    {ad.title}
                  </h4>
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
      </div>
    </div>
  );
}
