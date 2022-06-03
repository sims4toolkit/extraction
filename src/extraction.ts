import fs from "fs";
import path from "path";
import { CombinedTuningResource, Package, SimDataResource, XmlResource } from "@s4tk/models";
import { BinaryResourceType, SimDataGroup, TuningResourceType } from "@s4tk/models/enums";
import type { ResourceKeyPair } from "@s4tk/models/types";
import { formatResourceKey } from "@s4tk/hashing/formatting";
import type { ExtractionOptions } from "./types";
import PackageIndex from "./package-index";
import { getInstanceType, resourceIsExtractable } from "./helpers";

/**
 * TODO:
 * 
 * @param pkgPaths List of paths to packages to index
 * @param outDir Directory to output extracted tuning to
 * @param options Object of optional arguments
 */
export async function extractTuning(
  pkgPaths: string[],
  outDir: string,
  options?: ExtractionOptions
) {
  const index = new PackageIndex(options);

  pkgPaths.forEach(pkgPath => {
    index.readPackage(pkgPath);
  });

  const commentMap = index.commentMap;

  index.extractablePaths.forEach(pkgPath => {
    fs.readFile(pkgPath, null, (err, buffer) => {
      if (err) {
        console.error(err);
      } else {
        Package.extractResourcesAsync(buffer, {
          resourceFilter: resourceIsExtractable
        }).then(entries => {
          entries.forEach(entry => writeFilesForEntry(
            entry,
            outDir,
            commentMap,
            options
          ));
        });
      }
    });
  });
}

async function writeFilesForEntry(
  entry: ResourceKeyPair,
  outDir: string,
  commentMap: Map<string, string>,
  options?: ExtractionOptions
) {
  if (entry.key.type === BinaryResourceType.CombinedTuning) {
    (entry.value as CombinedTuningResource)
      .toTuningAsync({ commentMap })
      .then(tunings => {
        tunings.forEach(tuning => {
          const tuningEntry = {
            key: {
              type: getInstanceType(tuning.root.attributes.i),
              group: entry.key.group,
              instance: BigInt(tuning.root.id)
            },
            value: tuning
          };

          writeFilesForEntry(tuningEntry, outDir, commentMap, options);
        });
      });
  } else {
    const [subfolders, filename] = getFilePath(entry, options);
    const fileDir = path.join(outDir, subfolders);
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    const filepath = path.join(fileDir, filename);
    const content = getFileContent(entry);
    fs.writeFile(filepath, content, () => { });
  }
}

function getFilePath(
  entry: ResourceKeyPair,
  options?: ExtractionOptions
): [string, string] {
  const tgi = formatResourceKey(entry.key, "!");

  let subfolders: string;
  let filename: string;

  if (entry.key.type === BinaryResourceType.SimData) {
    filename = `${tgi}.${(entry.value as SimDataResource).instance.name}.SimData.xml`;

    if (options?.useTypeFolders)
      subfolders = "SimData";

    if (options?.useSecondaryFolders)
      subfolders = path.join(
        subfolders,
        SimDataGroup[entry.key.group] ?? "Unknown"
      );
  } else {
    const tuningName = TuningResourceType[entry.key.type] ?? "Unknown";
    filename = `${tgi}.${(entry.value as XmlResource).root.name}.${tuningName}.xml`;

    if (options?.useTypeFolders)
      subfolders = tuningName;

    if (options?.useSecondaryFolders)
      subfolders = path.join(
        subfolders,
        (entry.value as XmlResource).root.attributes.c ?? "Unknown"
      );
  }

  return [subfolders, filename];
}

function getFileContent(entry: ResourceKeyPair): Buffer {
  if (entry.key.type === BinaryResourceType.SimData) {
    const content = (entry.value as SimDataResource).toXmlDocument().toXml();
    return Buffer.from(content);
  } else {
    return (entry.value as XmlResource).getBuffer();
  }
}
