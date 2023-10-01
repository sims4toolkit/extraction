import path from "path";
import { StringTableLocale } from "@s4tk/models/enums";
import { PackagePaths } from "./types";
import { ExtractionOptions } from "./options";
import { safeGlob } from "./helpers";

function withPackCode(dir: string, filepath: string): [string, string] {
  const subpath = path.dirname(path.relative(dir, filepath));
  for (const folder of subpath.split(path.sep)) {
    if (/\d\d$/.test(folder)) {
      return [filepath, folder];
    }
  }
  return [filepath, "BG"];
}

/**
 * Finds paths to all packages containing simulation files.
 * 
 * @param dirs Array of directories to search in
 * @param options Options to configure
 */
export function locateSimulationPackages(
  dirs: string[],
  options?: ExtractionOptions
): PackagePaths {
  const source = new Map<string, string>()
  const delta = new Map<string, string>()

  dirs.forEach(dir => {
    if (options?.includeFullBuilds ?? true) {
      safeGlob(dir, "**", "SimulationFullBuild*.package")
        .forEach(fullBuildPath => {
          source.set(...withPackCode(dir, fullBuildPath));
        });
    }

    if (options?.includeDeltas ?? true) {
      safeGlob(dir, "**", "SimulationDeltaBuild*.package")
        .forEach(deltaBuildPath => {
          delta.set(...withPackCode(dir, deltaBuildPath));
        });

      // "SimulationContentDeltaBuild" is SDX
      safeGlob(dir, "**", "SimulationContentDeltaBuild*.package")
        .forEach(deltaBuildPath => {
          delta.set(...withPackCode(dir, deltaBuildPath));
        });
    }
  });

  return { source, delta };
}

/**
 * Finds paths to all packages containing string tables.
 * 
 * @param locale Locale of string tables to find
 * @param dirs Array of directories to search in
 * @param options Options to configure
 */
export function locateStringTablePackages(
  locale: StringTableLocale,
  dirs: string[],
  options?: ExtractionOptions
): PackagePaths {
  const source = new Map<string, string>()
  const delta = new Map<string, string>();

  const localeCode = StringTableLocale.getLocaleCode(locale);
  const packagePattern = `Strings_${localeCode}.package`;

  dirs.forEach(dir => {
    safeGlob(dir, "**", packagePattern).forEach(packagePath => {
      if (packagePath.includes("Delta")) {
        if (options?.includeDeltas ?? true) delta.set(...withPackCode(dir, packagePath));
      } else if (options?.includeFullBuilds ?? true) {
        source.set(...withPackCode(dir, packagePath));
      }
    });
  });

  return { source, delta };
}
