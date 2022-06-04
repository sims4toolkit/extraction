import path from "path";
import glob from "glob";
import { StringTableLocale } from "@s4tk/models/enums";
import { PackagePaths } from "../types";

/**
 * Finds paths to all packages containing simulation files.
 * 
 * @param dirs Array of diractories to search in
 */
export function locateSimulationPackages(dirs: string[]): PackagePaths {
  const source: string[] = []
  const delta: string[] = [];

  dirs.forEach(dir => {
    glob.sync(
      path.join(dir, "**", "SimulationFullBuild*.package")
    ).forEach(fullBuildPath => {
      source.push(fullBuildPath);
    });

    glob.sync(
      path.join(dir, "**", "SimulationDeltaBuild*.package")
    ).forEach(deltaBuildPath => {
      delta.push(deltaBuildPath);
    });
  });

  return { source, delta };
}

/**
 * Finds paths to all packages containing string tables.
 * 
 * @param locale Locale of string tables to find
 * @param dirs Array of diractories to search in
 */
export function locateStringTablePackages(
  locale: StringTableLocale,
  dirs: string[]
): PackagePaths {
  const source: string[] = []
  const delta: string[] = [];

  const localeCode = StringTableLocale.getLocaleCode(locale);
  const packagePattern = `Strings_${localeCode}.package`;

  dirs.forEach(dir => {
    glob.sync(
      path.join(dir, "**", packagePattern)
    ).forEach(packagePath => {
      (packagePath.includes("Delta") ? delta : source).push(packagePath);
    });
  });

  return { source, delta };
}
