import type { NextConfig } from "next";
import { deploymentBasePath } from './lib/deployment';

const isDev = process.env.NODE_ENV === 'development';
const isStaticExport = process.env.FATHOM_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  basePath: deploymentBasePath,
  output: isStaticExport ? 'export' : undefined,
  trailingSlash: isStaticExport,
  ...(isStaticExport ? {} : {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
                "style-src 'self' 'unsafe-inline'",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data:",
                "connect-src 'self'",
              ].join("; "),
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
