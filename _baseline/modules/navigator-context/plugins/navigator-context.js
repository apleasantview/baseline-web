/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function(eleventyConfig) {
  eleventyConfig.addNunjucksGlobal("_context", function() {
		return this.ctx;
	})
}
