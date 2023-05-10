import { StringTableLocale } from "@s4tk/models/enums";
import { PackagePaths } from "./types";
import { ExtractionOptions } from "./options";
import { safeGlob } from "./helpers";

/**
 * Finds paths to all packages containing simulation files.
 * 
 * @param dirs Array of diractories to search in
 * @param options Options to configure
 */
export function locateSimulationPackages(
  dirs: string[],
  options?: ExtractionOptions
): PackagePaths {
  const source: string[] = []
  const delta: string[] = [];

  dirs.forEach(dir => {
    if (options?.includeFullBuilds ?? true) {
      safeGlob(dir, "**", "SimulationFullBuild*.package")
        .forEach(fullBuildPath => {
          source.push(fullBuildPath);
        });
    }

    if (options?.includeDeltas ?? true) {
      safeGlob(dir, "**", "SimulationDeltaBuild*.package")
        .forEach(deltaBuildPath => {
          delta.push(deltaBuildPath);
        });

      // "SimulationContentDeltaBuild" is SDX
      safeGlob(dir, "**", "SimulationContentDeltaBuild*.package")
        .forEach(deltaBuildPath => {
          delta.push(deltaBuildPath);
        });
    }
  });

  return { source, delta };
}

/**
 * Finds paths to all packages containing string tables.
 * 
 * @param locale Locale of string tables to find
 * @param dirs Array of diractories to search in
 * @param options Options to configure
 */
export function locateStringTablePackages(
  locale: StringTableLocale,
  dirs: string[],
  options?: ExtractionOptions
): PackagePaths {
  const source: string[] = []
  const delta: string[] = [];

  const localeCode = StringTableLocale.getLocaleCode(locale);
  const packagePattern = `Strings_${localeCode}.package`;

  dirs.forEach(dir => {
    safeGlob(dir, "**", packagePattern).forEach(packagePath => {
      if (packagePath.includes("Delta")) {
        if (options?.includeDeltas ?? true) delta.push(packagePath);
      } else if (options?.includeFullBuilds ?? true) {
        source.push(packagePath);
      }
    });
  });

  return { source, delta };
}
