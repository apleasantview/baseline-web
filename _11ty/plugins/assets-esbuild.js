import path from "node:path";
import * as esbuild from "esbuild";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function assetsESBuild(eleventyConfig) {
	eleventyConfig.addTemplateFormats("js");

	eleventyConfig.addExtension("js", {
		outputFileExtension: "js",
		compile: async function (_inputContent, inputPath) {
			if (!inputPath.startsWith("./src/assets/js/")) {
				return;
			}

			return async () => {
				let result = await esbuild.build({
					entryPoints: [inputPath],
					bundle: true,
					minify: true,
					target: "es2020",
					write: false
				});

				return result.outputFiles[0].text;
			}
		}
	});
};
