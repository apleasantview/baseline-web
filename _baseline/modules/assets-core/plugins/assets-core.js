import { TemplatePath } from "@11ty/eleventy-utils";
import fg from "fast-glob";
import util from "node:util";
import {
	addTrailingSlash,
	resolveAssetsDir,
	buildGlobPatterns,
	createCollectionItem,
	logIfVerbose,
	warnIfVerbose,
	getVerbose,
} from "../../../helpers.js";

/**
 * eleventy-plugin-assets-core
 *
 * Features:
 *  - Adds a virtual directory `directories[dirKey]`
 *  - Exposes `assetsDir` + `assetsDirRelative` as global data
 *  - Adds filter + shortcode `assetUrl`
 *  - Adds a collection "assets" listing files in the assets subdirectory
 *  - Optional passthrough copying (directory → directory)
 *
 * Options:
 *  dirKey: string        - name inside dir object (default: "assets")
 *  patterns: string[]     - glob patterns relative to assets dir (default: all files)
 *  passthrough: boolean   - enable passthrough copy (default: false)
 *  passthroughOutput: string - where to copy in output (default: "assets")
 *  verbose: boolean       - console logging (defaults to global baseline verbose setting)
 */
/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function assetsCore(eleventyConfig, options = {}) {
	const userKey = options.dirKey || "assets";
	const patterns = options.patterns || ["**/*"];
	const passthrough = !!options.passthrough;
	const globalVerbose = getVerbose(eleventyConfig);
	const verbose = globalVerbose || options.verbose || false;

	// Normalize passthroughOutput → "/assets/"
	let passthroughOutput = options.passthroughOutput || "assets";
	passthroughOutput =
		"/" +
		passthroughOutput.replace(/^\/+/, "").replace(/\/+$/, "") +
		"/";

	// Extract raw directory value from config (can be done early)
	const rawDir = eleventyConfig.dir?.[userKey] || userKey;

	// Cached paths filled during `eleventy.directories`
	let cachedInputDir = null;
	let cachedOutputDir = null;
	let cachedAssetsDir = null;
	let cachedAssetsDirRelative = null;

	// Make available via global data
	eleventyConfig.addGlobalData("_baseline.assetsDir", () => cachedAssetsDir);
	eleventyConfig.addGlobalData("_baseline.assetsDirRelative", () => cachedAssetsDirRelative);

	// -------------------------------------------------------------
	// 1. Resolve directories on build start
	// -------------------------------------------------------------
	eleventyConfig.on("eleventy.directories", (directories) => {
		const inputDir = directories.input || "./";
		const outputDir = directories.output || "./";

		const { assetsDir, assetsDirRelative } = resolveAssetsDir(inputDir, rawDir);

		// Cache for use in collections & passthrough
		cachedInputDir = inputDir;
		cachedOutputDir = outputDir;
		cachedAssetsDir = assetsDir;
		cachedAssetsDirRelative = assetsDirRelative;

		// Add a virtual directory key
		Object.defineProperty(directories, userKey, {
			get() {
				return assetsDir;
			},
			enumerable: true,
			configurable: false,
		});

		logIfVerbose(verbose, "directories", util.inspect(directories, { showHidden: true, getters: true }))

		// URL helper (filter + shortcode)
		const makeAssetUrl = (filePathRelative) => {
			if (!filePathRelative) return passthroughOutput;

			const rel = filePathRelative.replace(/^\/+/, "");
			return TemplatePath.join(passthroughOutput, rel).replace(/\/$/, "");
		};

		eleventyConfig.addFilter("assetUrl", makeAssetUrl);
		eleventyConfig.addShortcode("assetUrl", makeAssetUrl);

		// Watch assets dir using the same patterns as the collection
		patterns
			.map((pattern) => TemplatePath.join(assetsDir, pattern))
			.forEach((watchPattern) => eleventyConfig.addWatchTarget(watchPattern));

		logIfVerbose(verbose, "assetsDir =", assetsDir);
		logIfVerbose(verbose, "passthroughOutput =", passthroughOutput);
	});

	// -------------------------------------------------------------
	// 2. Collection: enumerate asset files
	// -------------------------------------------------------------
	eleventyConfig.addCollection("assets", async () => {
		// Fallback: If directories event hasn't fired
		if (!cachedAssetsDir) {
			const inputDir = eleventyConfig.dir?.input || ".";
			const outputDir = eleventyConfig.dir?.output || ".";

			const { assetsDir, assetsDirRelative } = resolveAssetsDir(inputDir, rawDir);

			cachedInputDir = inputDir;
			cachedOutputDir = outputDir;
			cachedAssetsDir = assetsDir;
			cachedAssetsDirRelative = assetsDirRelative;

			warnIfVerbose(verbose, "Fallback directory resolution");
		}

		// Build globs (absolute) for fast-glob
		const globs = buildGlobPatterns(patterns, cachedAssetsDir);

		logIfVerbose(verbose, "scanning globs:", globs);

		// Glob for matching files with error handling
		let entries;
		try {
			entries = await fg(globs, {
				dot: true,
				onlyFiles: true,
				absolute: true,
				cwd: TemplatePath.getWorkingDir(),
			});
		} catch (error) {
			logIfVerbose(verbose, "Error scanning assets:", error);
			return [];
		}

		// Convert absolute paths to relative (Eleventy format) immediately
		return entries.map((absolutePath) => {
			// Convert to relative path from project root with ./
			const inputPath = TemplatePath.addLeadingDotSlash(
				TemplatePath.relativePath(absolutePath)
			);

			return createCollectionItem(
				inputPath,
				cachedInputDir,
				cachedOutputDir,
				cachedAssetsDirRelative,
				passthroughOutput,
				passthrough
			);
		});
	});

	// -------------------------------------------------------------
	// 3. Optional passthrough copy
	// -------------------------------------------------------------
	if (passthrough) {
		eleventyConfig.on("eleventy.before", ({ directories }) => {
			const src = directories[userKey] || cachedAssetsDir;

			// Safety check: ensure we have a valid source directory
			if (!src) {
				warnIfVerbose(verbose, "No assets directory found for passthrough");
				return;
			}

			// Add trailing slash → directory passthrough (faster + safer)
			const srcDir = addTrailingSlash(src);

			eleventyConfig.addPassthroughCopy({
				[srcDir]: passthroughOutput,
			});

			logIfVerbose(verbose, "passthrough:", srcDir, "→", passthroughOutput);
		});
	}
}
