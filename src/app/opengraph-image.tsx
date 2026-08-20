import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export const alt = `${SITE_NAME} -- ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share image for pages that don't have their own (a project photo, business logo, or guide featured image). */
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#FAF9F5",
        padding: "80px",
      }}
    >
      <div
        style={{
          fontSize: 88,
          color: "#173B35",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        YARDOLO
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 36,
          color: "#202624",
        }}
      >
        {SITE_TAGLINE}
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 26,
          color: "#6F7471",
        }}
      >
        Backyard projects & inspiration in Las Vegas, Nevada
      </div>
    </div>,
    { ...size }
  );
}
