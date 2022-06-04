import type { ResourcePosition } from "@s4tk/models/types";

/**
 * Maps file names to positions of resources within them.
 */
export type FileMap = Map<string, ResourcePosition[]>;

/**
 * A pairing of source and delta package paths. Source packages should be read
 * first, and overriden by delta packages if they contain the same resources.
 */
export interface PackagePaths {
  source: string[];
  delta: string[];
}

/**
 * An index of combined tuning and SimData in simulation packages.
 */
export interface SimulationIndex {
  combined: FileMap;
  simdata: FileMap;
}
