/* Site config */
import "dotenv/config";

import baseline from "./_baseline/eleventy.config.js";
import { config as _config } from "./_baseline/eleventy.config.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Import baseline
	eleventyConfig.addPlugin(baseline({
		verbose: true,
		Bob: "My number one guy."
	}));
};

export const config = _config;
