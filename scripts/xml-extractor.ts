/** Emulates Scumbumbo's XMLExtractor */
import { extractFiles } from "../dst/extraction";
import { ManifestType, NamingConvention } from "../dst/lib/types";
import { StringTableLocale } from "@s4tk/models/enums";

/** THE USER SHOULD EDIT THESE: */

// Directories to scan for the game's files
const directories = [
  '/Applications/The Sims 4 Packs',
  '/Applications/The Sims 4.app',
  'C:/Program Files/EA Games/The Sims 4',
];
// The output directory
const outDir = 'D:/S4TKXmlExtractor';
// The language used to restore string comments.
const targetLocale = StringTableLocale.English;
// How to format the names of the output files. "s4s", "s4pi", "tgi-name", "tgi-only", or "name-only"
const namingConvention: NamingConvention = "s4s";
// The format of the string manifest to generate. "properties", "json", "xml, or undefined for no manifest.
const stringManifest: ManifestType = "properties";
// The format of the string manifest to generate. "properties", "json", "xml, or undefined for no manifest.
const tuningManifest: ManifestType = "properties";

/** END OF USER EDIT SECTION */

extractFiles(directories, outDir,
  {
    extractSimData: false,
    insertGroupComment: false,
    namingConvention,
    stringManifest,
    targetLocale,
    tuningManifest,
    usePackSubfolders: true,
    usePrimarySubfolders: true,
    useRawPrimarySubfolderNames: true,
    useSecondarySubfolders: false,
    useTuningFoldersForSimData: true
  }
);
