import type { CombinedTuningResource, StringTableResource } from "@s4tk/models";
import { Package } from "@s4tk/models";
import { formatStringKey } from "@s4tk/hashing/formatting";
import type { FileMap, SimulationIndex } from "./types";

/**
 * Creates a map from tuning IDs (as decimal strings) to their file names.
 * 
 * @param index Simulation file index to base map on
 * @param map Optional map to add values to. If not provided, one is created.
 */
export function buildSimulationMap(
  index: SimulationIndex,
  map?: Map<string, string>
): Map<string, string> {
  map ??= new Map<string, string>();

  index.combined.forEach((positions, filepath) => {
    const cbt = Package.fetchResources<CombinedTuningResource>(filepath, positions);

    cbt.forEach(({ value }) => {
      const rNodes = value.dom.child.children.filter(node => node.tag === "R");

      rNodes.forEach(rNode => {
        rNode.children.forEach(tuningNode => {
          map.set(tuningNode.id as string, tuningNode.name);
        });
      });
    });
  });

  return map;
}

/**
 * Creates a map from string keys (as hex strings) to their actual values.
 * 
 * @param index String table file index to base map on
 * @param map Optional map to add values to. If not provided, one is created.
 */
export function buildStringTableMap(
  index: FileMap,
  map?: Map<string, string>
): Map<string, string> {
  map ??= new Map<string, string>();

  index.forEach((positions, filepath) => {
    const stbls = Package.fetchResources<StringTableResource>(filepath, positions);

    stbls.forEach(({ value }) => {
      value.entries.forEach(stringEntry => {
        map.set(formatStringKey(stringEntry.key), stringEntry.value);
      });
    });
  });

  return map;
}
