/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/articles",
        destination: "/bloggin/articles",
        permanent: true,
      },
      {
        source: "/article/:slug",
        destination: "/bloggin/article/:slug",
        permanent: true,
      },
      {
        source: "/drafts",
        destination: "/bloggin/drafts",
        permanent: true,
      },
      {
        source: "/new",
        destination: "/bloggin/new",
        permanent: true,
      },
      {
        source: "/edit/:slug",
        destination: "/bloggin/edit/:slug",
        permanent: true,
      },
    ];
  },
};

export default config;
