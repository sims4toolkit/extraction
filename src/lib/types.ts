import type { ResourcePosition } from "@s4tk/models/types";

/**
 * The format of a generated manifest file.
 */
export type ManifestType = "properties" | "json";

/**
 * How extracted files are named.
 */
export type NamingConvention = "s4s" | "tgi" | "tgi-name" | "name-only";

/**
 * An event that occurs during extraction. For use with logging/UI.
 */
export type ExtractionEvent =
  "index-stbl-start" |
  "index-stbl-end" |
  "index-sim-start" |
  "index-sim-end" |
  "mapping-start" |
  "mapping-end" |
  "extract-tuning-start" |
  "tuning-written" | // [complete CBT, total CBT, current TUN, total TUN]
  "extract-tuning-end" |
  "extract-simdata-start" |
  "simdata-written" | // [complete DBPF, total DBPF, current SD, total SD]
  "extract-simdata-end";

/**
 * A function that listens for extraction events.
 */
export type ExtractionEventListener
  = (event: ExtractionEvent, ...args: any[]) => void;

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
