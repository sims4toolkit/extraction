import path from "path";
import glob from "glob";
import { StringTableLocale } from "@s4tk/models/enums";
import { getLocaleCode } from "../helpers";
import { PackagePaths } from "../types";

//#region Constants

// FIXME: these will be configurable

const userChosenLocaleCode = getLocaleCode(StringTableLocale.English);

const sourceDirectories = [
  "/Applications/The Sims 4 Packs",
  "/Applications/The Sims 4.app/Contents",
];

//#endregion Constants

/**
 * Finds paths to all packages containing string tables.
 * 
 * @param dirs Array of diractories to search in
 */
export function findStblPackages(dirs: string[]): PackagePaths {
  const source: string[] = []
  const delta: string[] = [];

  dirs.forEach(dir => {
    glob.sync(
      path.join(dir, "**", `Strings_${userChosenLocaleCode}.package`)
    ).forEach(packagePath => {
      (packagePath.includes("Delta") ? delta : source).push(packagePath);
    });
  });

  return { source, delta };
}

/**
 * Finds paths to all packages containing simulation files.
 * 
 * @param dirs Array of diractories to search in
 */
export function findSimulationPackages(dirs: string[]): PackagePaths {
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
