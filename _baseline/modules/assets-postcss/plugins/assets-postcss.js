import path from "node:path";
import postcss from "postcss";
import postcssConfig from "../../../../postcss.config.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function assetsPostCSS(eleventyConfig) {
	eleventyConfig.addTemplateFormats("css");

	eleventyConfig.addExtension("css", {
		outputFileExtension: "css",
		compile: async function (_inputContent, inputPath) {
			if (!inputPath.startsWith("./src/assets/css/") || path.basename(inputPath) !== "index.css") {
				return;
			}

			return async () => {
				let result = await postcss(postcssConfig.plugins).process(_inputContent, {
					from: inputPath,
					map: postcssConfig.map // Enable or disable source maps based on the parameter
				});

				return result.css;
			};
		}
	});
};
