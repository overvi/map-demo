import { useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { AdLocation } from "@/types/AdLocation";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

interface AdMarkerProps {
  ad: AdLocation;
  averagePrice?: number;
  adsInGroup?: AdLocation[];
  onMarkerClick?: (ads: AdLocation[]) => void;
}

export function AdMarker({
  ad,
  averagePrice,
  adsInGroup,
  onMarkerClick,
}: AdMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  const displayPrice = averagePrice ?? ad.price;
  const adsToShow = adsInGroup ?? [ad];

  const icon = L.divIcon({
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="font-size: 20px;">📍</div>
        <div
          style="
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            margin-top: 2px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            color: #2563eb;
            border: 1px solid #2563eb;
          "
        >
          ${formatPrice(displayPrice)} تومان
        </div>
      </div>
    `,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, -50],
  });

  return (
    <Marker
      eventHandlers={{
        click: () => {
          if (onMarkerClick) {
            onMarkerClick(adsToShow);
          }
          map.flyTo([ad.lat, ad.lng], 14);
        },
      }}
      icon={icon}
      ref={markerRef}
      position={[ad.lat, ad.lng]}
    >
      <Popup>
        <div style={{ minWidth: "200px" }}>
          <img
            src={ad.image}
            alt={ad.title}
            style={{
              width: "100%",
              height: "120px",
              objectFit: "cover",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          />
          <strong>
            {adsToShow.length > 1 ? `${adsToShow.length} آگهی` : ad.title}
          </strong>
          <br />
          میانگین قیمت: {formatPrice(displayPrice)} تومان
          <br />
          {ad.city}
        </div>
      </Popup>
    </Marker>
  );
}
