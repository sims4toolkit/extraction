import { StringTableLocale } from "@s4tk/models/enums";
import { ExtractionEvent } from "./types";

export type ManifestType = "properties" | "json";

/**
 * Optional arguments for extracting tuning.
 */
export interface ExtractionOptions {
  /**
   * A listener that is called every time an event is emitted. An arbitrary
   * number of additional arguments may be passed as well. It is highly
   * recommended that you make this function async.
   */
  eventListener?: (event: ExtractionEvent, ...args: any[]) => void;

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
   * The kind of manifest to generate for strings. The manifest will map string
   * keys (hex strings) to their values. If not provided, no manifest is
   * generated. 
   */
  stringManifest?: ManifestType;

  /**
   * If restoring comments, this determines which language is used to restore
   * string comments. English by default.
   */
  targetLocale: StringTableLocale;

  /**
   * The kind of manifest to generate for tunings. The manifest will map tuning
   * IDs (decimal strings) to their file names. If not provided, no manifest is
   * generated. 
   */
  tuningManifest?: ManifestType;

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
};

/**
 * Sets default values for options if they are undefined or null. Returns a new
 * object so that the one given by the user isn't mutated.
 * 
 * @param options User-entered options
 */
export function setDefaultOptions(
  options?: Partial<ExtractionOptions>
): ExtractionOptions {
  return {
    eventListener: options?.eventListener,
    extractSimData: options?.extractSimData ?? true,
    extractTuning: options?.extractTuning ?? true,
    restoreComments: options?.restoreComments ?? true,
    stringManifest: options?.stringManifest,
    targetLocale: options?.targetLocale ?? StringTableLocale.English,
    tuningManifest: options?.tuningManifest,
    usePrimarySubfolders: options?.usePrimarySubfolders ?? true,
    useSecondarySubfolders: options?.useSecondarySubfolders ?? true,
  };
}
