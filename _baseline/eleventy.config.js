/* Site config */
import "dotenv/config";

import debug from "./debug.js";
import filters from "./filters.js";
import modules from "./modules.js";
import shortcodes from "./shortcodes.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Debug filters.
	eleventyConfig.addFilter("inspect", debug.inspect);
	eleventyConfig.addFilter("json", debug.json);
	eleventyConfig.addFilter("keys", debug.keys);

	// Filters.
	eleventyConfig.addFilter("markdown", filters.markdownFilter);
	eleventyConfig.addFilter("relatedPosts", filters.relatedPostsFilter);
	eleventyConfig.addFilter("inlinePostCSS", filters.inlinePostCSS);

	// Passthrough copy.
	eleventyConfig.addPassthroughCopy({ "./src/static": "/" });

	// Modules.
	eleventyConfig.addPlugin(modules.EleventyHtmlBasePlugin, { baseHref: process.env.URL || "/" });
	eleventyConfig.addPlugin(modules.assetsPostCSS);
	eleventyConfig.addPlugin(modules.assetsESBuild);

	// Shortcodes.
	eleventyConfig.addShortcode("image", shortcodes.imageShortcode);

	// Watch target.
	eleventyConfig.addWatchTarget('./src/assets/**/*.{css,js,svg,png,jpeg}');

	return {
		dir: {
			input: "src",
			output: "dist",
			data: "_data",
			includes: "_includes"
		},
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		templateFormats: ["html", "njk", "md"]
	}
};
