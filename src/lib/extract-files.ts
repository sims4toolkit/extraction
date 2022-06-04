import fs from "fs";
import path from "path";
import { CombinedTuningResource, Package, SimDataResource, XmlResource } from "@s4tk/models";
import { SimDataGroup, TuningResourceType } from "@s4tk/models/enums";
import { formatResourceKey, formatResourceTGI } from "@s4tk/hashing/formatting";
import type { ResourceKeyPair } from "@s4tk/models/types";
import { locateSimulationPackages, locateStringTablePackages } from "./locate-packages";
import { indexSimulationPackages, indexStringTablePackages } from "./index-packages";
import { buildSimulationMap, buildStringTableMap } from "./build-maps";
import { ExtractionOptions, setDefaultOptions } from "./options";

/**
 * Extracts all tuning and SimData files from the packages in the given
 * directories, restoring string and tuning comments along the way.
 * 
 * @param srcDirs Array of directories that contain packages to extract from
 * @param outDir Directory to output all extracted files to
 * @param options Options to configure
 */
export function extractFiles(
  srcDirs: string[],
  outDir: string,
  options?: Partial<ExtractionOptions>
) {
  options = setDefaultOptions(options);

  // creating stbl index
  if (options.restoreComments) {
    options.eventListener?.("index-stbl-start");
    const stblPaths = locateStringTablePackages(options.targetLocale, srcDirs);
    var stblIndex = indexStringTablePackages(stblPaths);
    options.eventListener?.("index-stbl-end");
  }

  // creating simulation index
  if (options.extractTuning || options.extractSimData) {
    options.eventListener?.("index-sim-start");
    var simPaths = locateSimulationPackages(srcDirs);
    var simIndex = indexSimulationPackages(simPaths, options as ExtractionOptions);
    options.eventListener?.("index-sim-end");
  }

  // building comment map
  let commentMap: Map<string, string>;
  if (options.restoreComments) {
    options.eventListener?.("comments-start");
    commentMap = new Map();
    buildStringTableMap(stblIndex, commentMap);
    buildSimulationMap(simIndex, commentMap);
    options.eventListener?.("comments-end");
  }

  // extracting tuning
  if (options.extractTuning) {
    options.eventListener?.("extract-tuning-start");
    let currentCbt = 0;
    simIndex.combined.forEach((positions, filepath) => {
      const cbt = Package.fetchResources<CombinedTuningResource>(
        filepath,
        positions
      );

      cbt.forEach(entry => {
        const tunings = entry.value.toTuning({ commentMap });
        tunings.forEach((tuning, i) => {
          writeTuningFile(
            outDir,
            entry.key.group,
            tuning,
            options as ExtractionOptions
          );

          options.eventListener?.(
            "tuning-written",
            currentCbt,
            simIndex.combined.size,
            i + 1,
            tunings.length
          );
        });
      });
      currentCbt++;
    });
    options.eventListener?.("extract-tuning-end");
  }

  // extracting simdata
  if (options.extractSimData) {
    let currentDbpf = 0;
    simIndex.simdata.forEach((positions, filepath) => {
      const simdatas = Package.fetchResources<SimDataResource>(
        filepath,
        positions
      );

      simdatas.forEach((entry, i) => {
        writeSimDataFile(outDir, entry, options as ExtractionOptions);
        options.eventListener?.(
          "simdata-written",
          currentDbpf,
          simIndex.simdata.size,
          i + 1,
          simdatas.length
        );
      });
      currentDbpf++;
    });
  }
}

/**
 * Writes a tuning file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param group Group of combined tuning that this tuning was found in
 * @param tuning Tuning file to write
 * @param options User options
 */
function writeTuningFile(
  outDir: string,
  group: number,
  tuning: XmlResource,
  options: ExtractionOptions
) {
  const type = TuningResourceType.parseAttr(tuning.root.attributes.i);
  const instance = BigInt(tuning.root.id);
  const key = formatResourceTGI(type, group, instance, "!");
  const filename = `${key}.${tuning.root.name}.xml`;
  let subfolders = outDir;
  if (options.usePrimarySubfolders)
    subfolders = path.join(subfolders, TuningResourceType[type] ?? "Unknown");
  if (options.useSecondarySubfolders)
    subfolders = path.join(subfolders, tuning.root.attributes.c ?? "Unknown");
  if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, tuning.getBuffer());
}

/**
 * Writes a SimData file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param simdata SimData entry to write
 * @param options User options
 */
function writeSimDataFile(
  outDir: string,
  simdata: ResourceKeyPair<SimDataResource>,
  options: ExtractionOptions
) {
  const key = formatResourceKey(simdata.key);
  const filename = `${key}.${simdata.value.instance.name}.xml`;
  let subfolders = outDir;
  if (options.usePrimarySubfolders)
    subfolders = path.join(subfolders, "SimData");
  if (options.useSecondarySubfolders)
    subfolders = path.join(subfolders, SimDataGroup[simdata.key.group] ?? "Unknown");
  if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, simdata.value.toXmlDocument().toXml());
}
