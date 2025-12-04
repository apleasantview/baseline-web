import path from "node:path";
import { TemplatePath } from "@11ty/eleventy-utils";
import fg from "fast-glob";

/**
 * Helper function to add trailing slash to a path
 * @param {string} path
 * @returns {string}
 */
function addTrailingSlash(path) {
  if (path.slice(-1) === "/") {
    return path;
  }
  return path + "/";
}

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
 *  verbose: boolean       - console logging
 */
/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function assetsCore(eleventyConfig, options = {}) {
  const userKey = options.dirKey || "assets";
  const patterns = options.patterns || ["**/*"];
  const passthrough = !!options.passthrough;
  const verbose = !!options.verbose;

  // Normalize passthroughOutput → "/assets/"
  let passthroughOutput = options.passthroughOutput || "assets";
  passthroughOutput =
    "/" +
    passthroughOutput.replace(/^\/+/, "").replace(/\/+$/, "") +
    "/";

  // Cached paths filled during `eleventy.directories`
  let cachedInputDir = null;
  let cachedAssetsDir = null;
  let cachedAssetsDirRelative = null;

  // -------------------------------------------------------------
  // 1. Resolve directories on build start
  // -------------------------------------------------------------
  eleventyConfig.on("eleventy.directories", (directories) => {
    const inputDir = directories.input || "./";

    const rawDir = eleventyConfig.dir?.[userKey] || userKey;
    const rawDirNormalized = TemplatePath.standardizeFilePath(rawDir);

    const assetsDir = addTrailingSlash(
      TemplatePath.join(inputDir, rawDirNormalized)
    );

    // Cache for use in collections & passthrough
    cachedInputDir = inputDir;
    cachedAssetsDir = assetsDir;
    cachedAssetsDirRelative = rawDirNormalized;

    // Add a virtual directory key
    Object.defineProperty(directories, userKey, {
      get() {
        return assetsDir;
      },
      enumerable: true,
      configurable: false,
    });

    // Make available via global data
    eleventyConfig.addGlobalData("assetsDir", assetsDir);
    eleventyConfig.addGlobalData("assetsDirRelative", cachedAssetsDirRelative);

    // URL helper (filter + shortcode)
    const makeAssetUrl = (fileRel) => {
      if (!fileRel) return passthroughOutput;

      const rel = fileRel.replace(/^\/+/, "");
      return TemplatePath.join(passthroughOutput, rel).replace(/\/$/, "");
    };

    eleventyConfig.addFilter("assetUrl", makeAssetUrl);
    eleventyConfig.addShortcode("assetUrl", makeAssetUrl);

    // Watch assets dir
    eleventyConfig.addWatchTarget(
      TemplatePath.join(assetsDir, "**/*")
    );

    if (verbose) {
      console.log("[eleventy-plugin-assets-core] assetsDir =", assetsDir);
      console.log("[eleventy-plugin-assets-core] passthroughOutput =", passthroughOutput);
    }
  });

  // -------------------------------------------------------------
  // 2. Collection: enumerate asset files
  // -------------------------------------------------------------
  eleventyConfig.addCollection("assets", async () => {
    // Fallback: If directories event hasn't fired
    if (!cachedAssetsDir) {
      const inputDir = eleventyConfig.dir?.input || ".";
      const rawDir = eleventyConfig.dir?.[userKey] || userKey;
      const rawDirNormalized = TemplatePath.standardizeFilePath(rawDir);

      cachedInputDir = inputDir;
      cachedAssetsDir = addTrailingSlash(
        TemplatePath.join(inputDir, rawDirNormalized)
      );
      cachedAssetsDirRelative = rawDirNormalized;

      if (verbose) {
        console.warn("[eleventy-plugin-assets-core] Fallback directory resolution");
      }
    }

    // Normalize absolute dirs for consistency across platforms
    const assetsDirAbsolute = TemplatePath.standardizeFilePath(
      TemplatePath.absolutePath(
        TemplatePath.stripLeadingDotSlash(cachedAssetsDir)
      )
    );

    const inputDirAbsolute = TemplatePath.standardizeFilePath(
      TemplatePath.absolutePath(
        TemplatePath.stripLeadingDotSlash(cachedInputDir)
      )
    );

    // Build globs (absolute) for fast-glob
    const globs = patterns.map((pattern) => {
      const normalized = TemplatePath.standardizeFilePath(pattern);
      return normalized.startsWith("/") || path.isAbsolute(normalized)
        ? normalized
        : TemplatePath.join(assetsDirAbsolute, normalized);
    });

    if (verbose) {
      console.log("[eleventy-plugin-assets-core] scanning globs:", globs);
    }

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
      if (verbose) {
        console.error("[eleventy-plugin-assets-core] Error scanning assets:", error);
      }
      return [];
    }

    // Pre-normalize for re-use
    const passthroughBase = TemplatePath.standardizeFilePath(assetsDirAbsolute);

    return entries.map((filePath) => {
      const normalizedPath = TemplatePath.standardizeFilePath(filePath);
      const ext = TemplatePath.getExtension(normalizedPath);
      const fileExt = ext ? ext.slice(1) : "";

      // Unique slug (basename without extension)
      const basename = TemplatePath.getLastPathSegment(normalizedPath, false);
      const fileSlug = ext ? basename.slice(0, -ext.length) : basename;

      const relToInput = TemplatePath.stripLeadingSubPath(
        normalizedPath,
        inputDirAbsolute
      );

      const relToAssets = TemplatePath.stripLeadingSubPath(
        normalizedPath,
        passthroughBase
      );

      const url = passthrough
        ? TemplatePath.join(passthroughOutput, relToAssets).replace(/\/$/, "")
        : undefined;

      return {
        inputPath: normalizedPath,
        outputPath: relToInput,
        basename,
        fileSlug,
        fileExt,
        dir: TemplatePath.getDirFromFilePath(normalizedPath),
        url,
      };
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
        if (verbose) {
          console.warn("[eleventy-plugin-assets-core] No assets directory found for passthrough");
        }
        return;
      }

      // Add trailing slash → directory passthrough (faster + safer)
      const srcDir = addTrailingSlash(src);

      eleventyConfig.addPassthroughCopy({
        [srcDir]: passthroughOutput,
      });

      if (verbose) {
        console.log("[eleventy-plugin-assets-core] passthrough:", srcDir, "→", passthroughOutput);
      }
    });
  }
}

