/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        workerThreads: false,
        cpus: 4,
        missingSuspenseWithCSRBailout: false
    },
    poweredByHeader: false,
    basePath: process.env.BASE_PATH ? process.env.BASE_PATH.toLowerCase() : ""
};

export default nextConfig;
