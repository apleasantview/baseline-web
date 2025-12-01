import fs from "fs/promises";
import * as esbuild from "esbuild";

export default async function inlineESbuild(jsFilePath) {
	try {
		// let jsContent = await fs.readFile(jsFilePath, 'utf8');

		let result = await esbuild.build({
			entryPoints: [jsFilePath],
			bundle: true,
			minify: true,
			target: "es2020",
			write: false
		});

		return `<script>${result.outputFiles[0].text}</script>`;
	} catch (error) {
		console.error(error);
		return `<script>/* Error processing JS */</script>`;
	}
} 
