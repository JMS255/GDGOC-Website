import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables the unauthorized()/forbidden() navigation helpers used for
    // auth/role gating (see src/lib/dal.ts and app/unauthorized.tsx, app/forbidden.tsx).
    authInterrupts: true,
  },
};

export default nextConfig;
