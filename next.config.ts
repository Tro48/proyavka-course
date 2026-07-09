import type { NextConfig } from "next";

import { parseEnv } from "./src/lib/env.schema";

// Валидация на этапе загрузки конфига: билд падает здесь, а не прод в рантайме.
parseEnv(process.env);

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // `radix-ui` и `motion` — пакеты-бочки: `import { Dialog } from "radix-ui"`
    // без этого тянет в бандл всё, что там лежит.
    optimizePackageImports: ["radix-ui", "motion"],
  },
};

export default nextConfig;
