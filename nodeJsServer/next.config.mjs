/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        workerThreads: false,
        cpus: 4,
        missingSuspenseWithCSRBailout: false
    },
    poweredByHeader: false
};

export default nextConfig;
