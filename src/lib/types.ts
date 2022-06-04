import { StringTableLocale } from "@s4tk/models/enums";
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

/**
 * Optional arguments for extracting tuning.
 */
export interface ExtractionOptions extends
  Partial<{
    /**
     * Whether or not SimData should be extracted. True by default.
     */
    extractSimData: boolean;

    /**
     * Whether or not tuning should be extracted from combined tuning. True by
     * default.
     */
    extractTuning: boolean;

    /**
     * Whether or not comments should be added for string keys and tuning IDs.
     * True by default.
     */
    restoreComments: boolean;

    /**
     * If restoring comments, this determines which language is used to restore
     * string comments. English by default.
     */
    targetLocale: StringTableLocale;

    /**
     * Whether or not to use primary subfolders when writing the files. This 
     * means tuning type for tuning files, and "SimData" for SimData files.
     * True by default.
     */
    usePrimarySubfolders: boolean;

    /**
     * Whether or not to use secondary subfolders when writing the files. This 
     * means class for tuning files, and group for SimData files. True by
     * default.
     */
    useSecondarySubfolders: boolean;
  }> { }
