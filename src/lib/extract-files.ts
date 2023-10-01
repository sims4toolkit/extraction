import fs from "fs";
import path from "path";
import { XmlCommentNode } from "@s4tk/xml-dom";
import { formatResourceGroup, formatResourceKey } from "@s4tk/hashing/formatting";
import { CombinedTuningResource, Package, SimDataResource, XmlResource } from "@s4tk/models";
import { BinaryResourceType, SimDataGroup, TuningResourceType } from "@s4tk/models/enums";
import type { ResourceKey, ResourceKeyPair } from "@s4tk/models/types";
import { locateSimulationPackages, locateStringTablePackages } from "./locate-packages";
import { indexSimulationPackages, indexStringTablePackages } from "./index-packages";
import { buildSimulationMap, buildStringTableMap } from "./build-maps";
import { ExtractionOptions, setDefaultOptions } from "./options";
import { ManifestType } from "./types";

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
  if (options.restoreComments || options.stringManifest) {
    options.eventListener?.("index-stbl-start");
    const stblPaths = locateStringTablePackages(options.targetLocale, srcDirs, options as ExtractionOptions);
    var stblIndex = indexStringTablePackages(stblPaths);
    options.eventListener?.("index-stbl-end");
  }

  // creating simulation index
  if (options.extractTuning || options.extractSimData || options.tuningManifest) {
    options.eventListener?.("index-sim-start");
    var simPaths = locateSimulationPackages(srcDirs, options as ExtractionOptions);
    var simIndex = indexSimulationPackages(simPaths, options as ExtractionOptions);
    options.eventListener?.("index-sim-end");
  }

  // building maps & manifests
  let commentMap: Map<string, string>;
  let startedMapping = false;
  const startMapping = () => {
    if (!startedMapping) {
      options.eventListener?.("mapping-start");
      startedMapping = true;
    }
  };

  if (options.restoreComments || options.stringManifest) {
    startMapping();
    const stringMap = buildStringTableMap(stblIndex);
    if (options.stringManifest)
      writeStringManifest(outDir, stringMap, options as ExtractionOptions);
    if (options.restoreComments) {
      commentMap = stringMap;
      if (options.extractTuning) stringMap.forEach((value, key) => {
        const trimmedKey = key.replace(/^0x0+/, "0x");
        commentMap.set(trimmedKey, '"' + value + '"');
      });
    }
  }

  if (options.tuningManifest) {
    startMapping();
    const tuningMap = buildSimulationMap(simIndex);
    writeTuningManifest(outDir, tuningMap, options as ExtractionOptions);
    if (options.restoreComments)
      tuningMap.forEach((name, id) => commentMap.set(id, name));
  } else if (options.restoreComments) {
    startMapping();
    buildSimulationMap(simIndex, commentMap);
  }

  if (startedMapping) options.eventListener?.("mapping-end");

  // extracting tuning
  const tuningDirs = new Map<bigint, string>();
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
            simPaths.source.get(filepath) ?? simPaths.delta.get(filepath),
            tuning,
            tuningDirs,
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
    options.eventListener?.("extract-simdata-start");
    let currentDbpf = 0;
    simIndex.simdata.forEach((positions, filepath) => {
      const simdatas = Package.fetchResources<SimDataResource>(
        filepath,
        positions
      );

      simdatas.forEach((entry, i) => {
        writeSimDataFile(
          outDir,
          entry,
          simPaths.source.get(filepath) ?? simPaths.delta.get(filepath),
          tuningDirs,
          options as ExtractionOptions
        );

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
    options.eventListener?.("extract-simdata-end");
  }
}

//#region Helpers

/**
 * Writes a tuning file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param group Group of combined tuning that this tuning was found in
 * @param pack Code of the pack the tuning was found in
 * @param tuning Tuning file to write
 * @param tuningDirs Mapping of tuning instances to the folders they are written to
 * @param options User options
 */
function writeTuningFile(
  outDir: string,
  group: number,
  pack: string,
  tuning: XmlResource,
  tuningDirs: Map<bigint, string>,
  options: ExtractionOptions
) {
  const type = TuningResourceType.parseAttr(tuning.root.attributes.i);
  const instance = BigInt(tuning.root.id);
  const key = { type, group, instance };
  const filename = getFileName(key, tuning.root.name, options);
  if (group && options.insertGroupComment) tuning.updateDom(dom => {
    dom.children.unshift(new XmlCommentNode(`S4TK Group: ${formatResourceGroup(group)}`));
  });
  let subfolders = outDir;
  if (options.usePackSubfolders)
    subfolders = path.join(subfolders, pack);
  if (options.usePrimarySubfolders) {
    let sub = TuningResourceType[type];
    if (options.useRawPrimarySubfolderNames) sub = TuningResourceType.getAttr(type) || "tun";
    subfolders = path.join(subfolders, sub ?? "Unknown");
  }
  if (options.useSecondarySubfolders)
    subfolders = path.join(subfolders, tuning.root.attributes.c ?? "Unknown");
  if (options.useTuningFoldersForSimData)
    tuningDirs.set(instance, subfolders);
  if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, tuning.getBuffer());
}

/**
 * Writes a SimData file to disc.
 * 
 * @param outDir Directory to output this file to
 * @param simdata SimData entry to write
 * @param pack Code of the pack the SimData was found in
 * @param tuningDirs Mapping of tuning instances to the folders they are written to
 * @param options User options
 */
function writeSimDataFile(
  outDir: string,
  simdata: ResourceKeyPair<SimDataResource>,
  pack: string,
  tuningDirs: Map<bigint, string>,
  options: ExtractionOptions
) {
  const filename = getFileName(simdata.key, `${simdata.value.instance.name}.SimData`, options);
  let subfolders = options.useTuningFoldersForSimData
    ? tuningDirs.get(simdata.key.instance)
    : undefined;
  if (!subfolders) {
    subfolders = outDir;
    if (options.usePackSubfolders)
      subfolders = path.join(subfolders, pack);
    if (options.usePrimarySubfolders)
      subfolders = path.join(subfolders, "SimData");
    if (options.useSecondarySubfolders)
      subfolders = path.join(subfolders, SimDataGroup[simdata.key.group] ?? "Unknown");
    if (!fs.existsSync(subfolders)) fs.mkdirSync(subfolders, { recursive: true });
  }
  const filepath = path.join(subfolders, filename);
  fs.writeFileSync(filepath, simdata.value.toXmlDocument().toXml());
}

/**
 * Gets the filename for a resource.
 * 
 * @param key Key of resource to get filename for
 * @param filename Name of resource
 * @param options Use options
 */
function getFileName(
  key: ResourceKey,
  filename: string,
  options: ExtractionOptions
): string {
  switch (options.namingConvention) {
    case "s4s":
      let type = TuningResourceType[key.type];
      if (!type) type = BinaryResourceType[key.type];
      else if (!type.endsWith("Tuning")) type += "Tuning";
      return formatResourceKey(key, "!") + "." + filename + "." + type + ".xml";
    case "s4pi":
      return "S4_" + formatResourceKey(key, "_") + ".xml";
    case "tgi-name":
      return formatResourceKey(key, "_") + "." + filename + ".xml";
    case "tgi-only":
      return formatResourceKey(key, "_") + ".xml";
    case "name-only":
      return filename + ".xml";
  }
}

/**
 * Writes a string manifest file.
 * 
 * @param outDir Directory to output this file to 
 * @param map Map of string keys to values
 * @param options User options
 */
function writeStringManifest(
  outDir: string,
  map: Map<string, string>,
  options: ExtractionOptions
) {
  writeManifest(outDir, map, "StringManifest", options.stringManifest);
}

/**
 * Writes a tuning manifest file.
 * 
 * @param outDir Directory to output this file to 
 * @param map Map of tuning IDs to names
 * @param options User options
 */
function writeTuningManifest(
  outDir: string,
  map: Map<string, string>,
  options: ExtractionOptions
) {
  writeManifest(outDir, map, "TuningManifest", options.tuningManifest);
}

/**
 * Writes a manifest file.
 * 
 * @param outDir Directory to output this file to 
 * @param map Map of tuning IDs to names
 * @param filename Name of manifest file
 * @param extension Manifest type
 */
function writeManifest(
  outDir: string,
  map: Map<string, string>,
  filename: string,
  extension: ManifestType
) {
  if (extension === "properties") {
    const lines: string[] = [];

    map.forEach((value, key) => {
      lines.push(key + "=" + value);
    });

    var content = lines.join("\n");
  } else if (extension === "json") {
    const items: { key: string; value: string }[] = [];

    map.forEach((value, key) => {
      items.push({ key, value });
    });

    var content = JSON.stringify(items, null, 2);
  } else if (extension === "xml") {
    const lines: string[] = [];

    map.forEach((value, key) => {
      lines.push(`${key}<!--${value}-->`);
    });

    var content = lines.join("\n");
  } else {
    throw new Error(`Invalid manifest type '${extension}', must be one of: 'properties', 'json', or 'xml'`);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filepath = path.join(outDir, `${filename}.${extension}`);
  fs.writeFileSync(filepath, content);
}

//#endregion Helpers
