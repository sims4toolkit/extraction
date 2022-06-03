import type { StringTableLocale } from "@s4tk/models/enums";

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
    /** Whether or not to use type folders. False by default. */
    typeFolders: boolean;

    /** Whether or not to use class folders. False by default. */
    classFolders: boolean;
  }> { }
