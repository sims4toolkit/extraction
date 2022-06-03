import type { StringTableLocale } from "@s4tk/models/enums";

type ManifestFileType = "properties" | "json";

/**
 * Optional arguments for indexing tuning.
 */
interface IndexingOptions extends
  Partial<{
    /** Locale of STBLs to index. English by default. */
    locale: StringTableLocale;
  }> { }

/**
 * Optional arguments for extracting tuning.
 */
interface ExtractionOptions extends
  IndexingOptions,
  Partial<{
    /**
     * What kind of manifest to generate for strings. If null, no manifest is
     * generated. Null by default.
     */
    stringManifest: ManifestFileType;

    /**
     * What kind of manifest to generate for tuning. If null, no manifest is
     * generated. Null by default.
     */
    tuningManifest: ManifestFileType;

    /** Whether or not to use class/group folders. False by default. */
    useSecondaryFolders: boolean;

    /** Whether or not to use type folders. False by default. */
    useTypeFolders: boolean;
  }> { }
