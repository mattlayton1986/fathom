import type { MetadataRoute } from "next";
import { deploymentBasePath } from "@/lib/deployment";

export const dynamic = `force-static`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fathom JSON Explorer",
    short_name: "Fathom",
    description: "Parse, inspect, and explore JSON data",
    start_url: `${deploymentBasePath}/`,
    display: "standalone",
    background_color: "#060c14",
    theme_color: "#0d1c2e",
    icons: [
      {
        src: `${deploymentBasePath}/icons/fathom-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${deploymentBasePath}/icons/fathom-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}