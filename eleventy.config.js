/* Site config */
import "dotenv/config";

import baseline from "./_baseline/eleventy.config.js";
import { config as _config } from "./_baseline/eleventy.config.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Import baseline
	eleventyConfig.addPlugin(baseline({
		bob: "number one guy"
	}));

	eleventyConfig.addFilter("isString", function(object) { 
		return typeof obj == 'string';
	 });
};

export const config = _config;
