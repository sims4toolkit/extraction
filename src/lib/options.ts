import { StringTableLocale } from "@s4tk/models/enums";
import { ExtractionEventListener, ManifestType, NamingConvention } from "./types";

/**
 * Optional arguments for extracting tuning.
 */
export interface ExtractionOptions {
  /**
   * A listener that is called every time an event is emitted. An arbitrary
   * number of additional arguments may be passed as well. It is highly
   * recommended that you make this function async.
   */
  eventListener?: ExtractionEventListener;

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
   * Whether or not to include delta packages. True by default. Either this or
   * `includeFullBuilds` needs to be true in order to extract anything.
   */
  includeDeltas: boolean;

  /**
   * Whether or not to include full packages. True by default. Either this or
   * `includeDeltas` needs to be true in order to extract anything.
   */
  includeFullBuilds: boolean;

  /**
   * Whether or not to include a comment that tells the
   * [S4TK VS Code extension](https://vscode.sims4toolkit.com/) which group to
   * use instead of 0. True by default.
   * 
   * Comments will appear at the top of the document, such as:
   * ```xml
   * <!-- S4TK Group: 00000014 -->
   * ```
   */
  insertGroupComment: boolean;

  /**
   * Naming convention to use. Default is "s4s".
   * 
   * Options
   * - `s4s` -> `TTTTTTTT!GGGGGGGG!IIIIIIIIIIIIIIII.filename.xml`
   * - `s4pi` -> `S4_TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.filename.xml`
   * - `tgi-name` -> `TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.filename.xml`
   * - `tgi-only` -> `TTTTTTTT_GGGGGGGG_IIIIIIIIIIIIIIII.xml`
   * - `name-only` -> `filename.xml`
   */
  namingConvention: NamingConvention;

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
   * Whether or not to use the pack id (e.g. BG, GP01, SP24) as the first
   * subfolder for all files. False by default.
   */
  usePackSubfolders: boolean;

  /**
   * Whether or not to use primary subfolders when writing the files. This 
   * means tuning type for tuning files, and "SimData" for SimData files.
   * True by default.
   * 
   * Note: If `useTuningFoldersForSimData` is true, then the "SimData" folder
   * and all of its subfolders will never be created.
   */
  usePrimarySubfolders: boolean;

  /**
   * For usePrimarySubfolders, whether to format the tuning types as they
   * appear in tunings, instead of the more friendly PascalCase.
   * False by default.
   */
  useRawPrimarySubfolderNames: boolean;

  /**
   * Whether or not to use secondary subfolders when writing the files. This 
   * means class for tuning files, and group for SimData files. True by
   * default.
   * 
   * Note: If `useTuningFoldersForSimData` is true, then the "SimData" folder
   * and all of its subfolders will never be created.
   */
  useSecondarySubfolders: boolean;

  /**
   * Whether or not to write SimData files to the folder that contains their
   * matching tuning. SimData files will have the same name, but with 'SimData'
   * append before the file extension. True by default.
   */
  useTuningFoldersForSimData: boolean;
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
    includeDeltas: options?.includeDeltas ?? true,
    includeFullBuilds: options?.includeFullBuilds ?? true,
    insertGroupComment: options?.insertGroupComment ?? true,
    namingConvention: options?.namingConvention ?? "s4s",
    restoreComments: options?.restoreComments ?? true,
    stringManifest: options?.stringManifest,
    targetLocale: options?.targetLocale ?? StringTableLocale.English,
    tuningManifest: options?.tuningManifest,
    usePackSubfolders: options?.usePackSubfolders ?? false,
    usePrimarySubfolders: options?.usePrimarySubfolders ?? true,
    useRawPrimarySubfolderNames: options?.useRawPrimarySubfolderNames ?? false,
    useSecondarySubfolders: options?.useSecondarySubfolders ?? true,
    useTuningFoldersForSimData: options?.useTuningFoldersForSimData ?? true,
  };
}
