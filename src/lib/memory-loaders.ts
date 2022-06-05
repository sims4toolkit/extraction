import { StringTableLocale } from "@s4tk/models/enums";
import { buildSimulationMap, buildStringTableMap } from "./build-maps";
import { indexSimulationPackages, indexStringTablePackages } from "./index-packages";
import { locateSimulationPackages, locateStringTablePackages } from "./locate-packages";
import { setDefaultOptions } from "./options";

/**
 * Finds all of the most recent strings for a given locale, and returns them
 * in a map of their keys to values. Searches for English by default.
 * 
 * @param srcDirs Array of directories to search for strings
 * @param locale Locale of strings to extract
 */
export function loadStringMap(
  srcDirs: string[],
  locale = StringTableLocale.English
): Map<string, string> {
  const stblPaths = locateStringTablePackages(locale, srcDirs);
  const stblIndex = indexStringTablePackages(stblPaths);
  return buildStringTableMap(stblIndex);
}

/**
 * Finds all of the most recent tunings, and returns them in a map of their IDs
 * to names.
 * 
 * @param srcDirs Array of directories to search for tunings
 */
export function loadTuningMap(
  srcDirs: string[]
): Map<string, string> {
  const simPaths = locateSimulationPackages(srcDirs);
  const simIndex = indexSimulationPackages(simPaths, setDefaultOptions({
    extractSimData: false,
  }));
  return buildSimulationMap(simIndex);
}
