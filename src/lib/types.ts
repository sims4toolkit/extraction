import type { ResourcePosition } from "@s4tk/models/types";

/**
 * An event that occurs during extraction. For use with logging/UI.
 */
export type ExtractionEvent =
  "index-stbl-start" |
  "index-stbl-end" |
  "index-sim-start" |
  "index-sim-end" |
  "comments-start" |
  "comments-end" |
  "extract-tuning-start" |
  "tuning-written" | // [complete CBT, total CBT, current TUN, total TUN]
  "extract-tuning-end" |
  "extract-simdata-start" |
  "simdata-written" | // [complete DBPF, total DBPF, current SD, total SD]
  "extract-simdata-end";

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
