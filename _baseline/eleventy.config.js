/* Site config */
import "dotenv/config";

import debug from "./debug.js";
import filters from "./filters.js";
import modules from "./modules.js";
import shortcodes from "./shortcodes.js";

/**
 * Eleventy Baseline Plugin (factory-style)
 * @param {object} options - Custom options for the plugin.
 * @returns {(eleventyConfig: UserConfig) => void}
 */
export default function baseline(options = {}) {
	/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
	return async function(eleventyConfig) {
		const config = { ...options };

		eleventyConfig.addGlobalData("_baseline", config);

		// Debug filters and shortcodes.
		eleventyConfig.addFilter("inspect", debug.inspect);
		eleventyConfig.addFilter("json", debug.json);
		eleventyConfig.addFilter("keys", debug.keys);
		eleventyConfig.addShortcode("ctx", debug.context);

		// Filters.
		eleventyConfig.addFilter("markdownify", filters.markdownFilter);
		eleventyConfig.addFilter("relatedPosts", filters.relatedPostsFilter);
		eleventyConfig.addFilter("inlinePostCSS", filters.inlinePostCSS);
		eleventyConfig.addFilter("inlineESbuild", filters.inlineESbuild);
		eleventyConfig.addFilter("isString", filters.isStringFilter);

		// Passthrough copy.
		eleventyConfig.addPassthroughCopy({ "./src/static": "/" });

		// Modules.
		eleventyConfig.addPlugin(modules.EleventyHtmlBasePlugin, { baseHref: process.env.URL || "/" });
		eleventyConfig.addPlugin(modules.assetsPostCSS);
		eleventyConfig.addPlugin(modules.assetsESBuild);
		eleventyConfig.addPlugin(modules.coreNavigator);

		// Shortcodes.
		eleventyConfig.addShortcode("image", shortcodes.imageShortcode);

		// Watch target.
		eleventyConfig.addWatchTarget('./src/assets/**/*.{css,js,svg,png,jpeg}');
	};
}

export const config = {
	dir: {
		input: "src",
		output: "dist",
		data: "_data",
		includes: "_includes"
	},
	htmlTemplateEngine: "njk",
	markdownTemplateEngine: "njk",
	templateFormats: ["html", "njk", "md"]
};
