/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        workerThreads: false,
        cpus: 4,
        missingSuspenseWithCSRBailout: false
    },
    poweredByHeader: false,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH.toLowerCase() : ""
};

export default nextConfig;
