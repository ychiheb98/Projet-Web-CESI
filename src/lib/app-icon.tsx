import { ImageResponse } from "next/og";

export function renderAppIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0d0c, #14231c)",
        }}
      >
        <span
          style={{
            fontSize: size * 0.56,
            fontWeight: 700,
            color: "#34d399",
            fontFamily: "sans-serif",
          }}
        >
          $
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
