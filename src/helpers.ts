import { BinaryResourceType, TuningResourceType } from "@s4tk/models/enums";
import glob from "glob";
import path from "path";

/**
 * TODO:
 * 
 * @param dirs TODO:
 */
export function locatePackages(dirs: string[]): string[] {
  const paths: string[] = [];

  dirs.forEach(dir => {
    paths.push(...glob.sync(path.join(dir, "**", "*.package")));
  });

  return paths;
}

/**
 * TODO:
 * 
 * @param type TODO:
 */
export function resourceIsExtractable(type: number): boolean {
  return type === BinaryResourceType.CombinedTuning
    || type === BinaryResourceType.SimData
    || (type in TuningResourceType);
}
