export default function Home() {
  const src = "/embed?panel=1&draw=1";

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src={src}
        title="Map Embed"
        style={{
          border: 0,
          width: "100%",
          height: "100%",
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
