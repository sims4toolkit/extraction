import type { ResourcePosition } from "@s4tk/models/types";

/**
 * A pairing of source and delta package paths. Source packages should be read
 * first, and overriden by delta packages if they contain the same resources.
 */
export interface PackagePaths {
  source: string[];
  delta: string[];
}

/**
 * Maps file names to positions of resources within them.
 */
export type FileMap = Map<string, ResourcePosition[]>;

/**
 * An index of combined tuning and SimData in simulation packages.
 */
export interface SimulationIndex {
  combined: FileMap;
  simdata: FileMap;
}

// /**
//  * Optional arguments for indexing tuning.
//  */
// interface IndexingOptions extends
//   Partial<{
//     /** Locale of STBLs to index. English by default. */
//     locale: StringTableLocale;
//   }> { }

// /**
//  * Optional arguments for extracting tuning.
//  */
// interface ExtractionOptions extends
//   IndexingOptions,
//   Partial<{
//     /** Whether or not to use class/group folders. False by default. */
//     useSecondaryFolders: boolean;

//     /** Whether or not to use type folders. False by default. */
//     useTypeFolders: boolean;
//   }> { }
