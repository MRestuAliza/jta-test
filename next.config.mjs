/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["lh3.googleusercontent.com", "img.daisyui.com", "ik.imagekit.io"],
    },
    async rewrites() {
        return [
            {
                source: '/mahasiswa/saran/:path*',
                destination: '/saran/:path*', // Arahkan ke folder fisik /saran
            },
        ];
    },
};

export default nextConfig;
