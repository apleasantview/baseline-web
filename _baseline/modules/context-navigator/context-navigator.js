/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function(eleventyConfig) {
  eleventyConfig.addNunjucksGlobal("navigator", function() {
		return this.ctx;
	})
}
