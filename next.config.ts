import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [],
	images: {
		domains: [
			"github.com",
			"cdn.simpleicons.org",
		],
	},
};

export default nextConfig;
