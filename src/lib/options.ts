import { StringTableLocale } from "@s4tk/models/enums";

/**
 * Optional arguments for extracting tuning.
 */
export interface ExtractionOptions {
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
    extractSimData: options?.extractSimData ?? true,
    extractTuning: options?.extractTuning ?? true,
    restoreComments: options?.restoreComments ?? true,
    targetLocale: options?.targetLocale ?? StringTableLocale.English,
    usePrimarySubfolders: options?.usePrimarySubfolders ?? true,
    useSecondarySubfolders: options?.useSecondarySubfolders ?? true,
  };
}
