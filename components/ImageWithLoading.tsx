"use client";

import { useState, useEffect, useRef } from "react";

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}

export function ImageWithLoading({
  src,
  alt,
  style,
  className,
}: ImageWithLoadingProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoading(false);
    }
  }, []);

  const containerStyle = style
    ? { position: "relative" as const, ...style }
    : { position: "relative" as const };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #e5e7eb",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        )}
        {error ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            تصویر
          </div>
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={className}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.3s",
              display: "block",
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </div>
    </>
  );
}
