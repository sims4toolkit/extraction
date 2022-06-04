import fs from "fs";
import path from "path";
import { CombinedTuningResource, Package, SimDataResource, XmlResource } from "@s4tk/models";
import { SimDataGroup, TuningResourceType } from "@s4tk/models/enums";
import { formatResourceKey, formatResourceTGI } from "@s4tk/hashing/formatting";
import type { ResourceKeyPair } from "@s4tk/models/types";
import { locateSimulationPackages, locateStringTablePackages } from "./locate-packages";
import { indexSimulationPackages, indexStringTablePackages } from "./index-packages";
import { buildSimulationMap, buildStringTableMap } from "./build-maps";

// FIXME: temporary
// const sourceDirectories = [
//   "/Applications/The Sims 4 Packs",
//   "/Applications/The Sims 4.app/Contents",
// ];

// FIXME: delete
const TEMPORARY_USER_LOCALE = 0;


/**
 * Extracts all tuning and SimData files from the packages in the given
 * directories, restoring string and tuning comments along the way.
 * 
 * @param srcDirs Array of directories that contain packages to extract from
 * @param outDir Directory to output all extracted files to
 */
export function extractFiles(srcDirs: string[], outDir: string) {
  // creating stbl index
  const stblPaths = locateStringTablePackages(TEMPORARY_USER_LOCALE, srcDirs);
  const stblIndex = indexStringTablePackages(stblPaths);

  // creating simulation index
  const simPaths = locateSimulationPackages(srcDirs);
  const simIndex = indexSimulationPackages(simPaths);

  // building comment map
  const commentMap = new Map<string, string>();
  buildStringTableMap(stblIndex, commentMap);
  buildSimulationMap(simIndex, commentMap);

  // extracting tuning
  simIndex.combined.forEach((positions, filepath) => {
    const cbt = Package.fetchResources<CombinedTuningResource>(filepath, positions);
    cbt.forEach(entry => {
      entry.value.toTuning({ commentMap }).forEach(tuning => {
        writeTuningFile(outDir, entry.key.group, tuning);
      });
    });
  });

  // extracting simdata
  simIndex.simdata.forEach((positions, filepath) => {
    const simdatas = Package.fetchResources<SimDataResource>(filepath, positions);
    simdatas.forEach(entry => {
      writeSimDataFile(outDir, entry);
    });
  });
}

/**
 * Writes a tuning file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param group Group of combined tuning that this tuning was found in
 * @param tuning Tuning file to write
 */
function writeTuningFile(outDir: string, group: number, tuning: XmlResource) {
  const type = TuningResourceType.parseAttr(tuning.root.attributes.i);
  const instance = BigInt(tuning.root.id);
  const key = formatResourceTGI(type, group, instance, "!");
  const filename = `${key}.${tuning.root.name}.xml`;
  const typeFolder = TuningResourceType[type] ?? "Unknown";
  const classFolder = tuning.root.attributes.c ?? "Unknown";
  const subfolders = path.join(outDir, typeFolder, classFolder);
  if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, tuning.getBuffer());
}

/**
 * Writes a SimData file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param simdata SimData entry to write
 */
function writeSimDataFile(outDir: string, simdata: ResourceKeyPair<SimDataResource>) {
  const key = formatResourceKey(simdata.key);
  const filename = `${key}.${simdata.value.instance.name}.xml`;
  const groupFolder = SimDataGroup[simdata.key.group] ?? "Unknown";
  const subfolders = path.join(outDir, "SimData", groupFolder);
  if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, simdata.value.toXmlDocument().toXml());
}
