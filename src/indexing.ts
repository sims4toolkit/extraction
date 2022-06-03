import fs from "fs";
import path from "path";
import * as glob from "glob";
import { CombinedTuningResource, Package, StringTableResource, XmlResource } from "@s4tk/models";
import { BinaryResourceType, StringTableLocale, TuningResourceType } from "@s4tk/models/enums";
import { formatStringKey } from "@s4tk/hashing/formatting";
import type { IndexingOptions } from "./types";

/**
 * TODO:
 * 
 * @param dirs TODO:
 */
export function indexDirectories(dirs: string[], options?: IndexingOptions): Map<string, string> {
  const map = new Map<string, string>();

  dirs.forEach((dir, i) => {
    console.log(`Dir ${i + 1} of ${dirs.length}`);
    const pkgPaths = glob.sync(path.join(dir, "**", "*.package"));
    pkgPaths.forEach((filepath, j) => {
      console.log(` | Pkg ${j + 1} of ${pkgPaths.length}`);
      const buffer = fs.readFileSync(filepath);
      indexPackage(buffer, map, options);
    });
  });

  return map;
}

function indexPackage(buffer: Buffer, map: Map<string, string>, options?: IndexingOptions) {
  const targetLocale = options?.locale ?? StringTableLocale.English;

  Package.extractResources(buffer, {
    resourceFilter(type, _, instance) {
      if (type === BinaryResourceType.CombinedTuning || (type in TuningResourceType)) {
        return true;
      } else if (type === BinaryResourceType.StringTable) {
        return StringTableLocale.getLocale(instance) === targetLocale;
      } else {
        return false;
      }
    }
  }).forEach(({ key, value }) => {
    if (key.type === BinaryResourceType.StringTable) {
      indexStringTable(value as StringTableResource, map);
    } else if (key.type === BinaryResourceType.CombinedTuning) {
      indexCombinedTuning(value as CombinedTuningResource, map);
    } else {
      indexTuning(value as XmlResource, map);
    }
  });
}

function indexStringTable(stbl: StringTableResource, map: Map<string, string>) {
  stbl.entries.forEach(({ key, value }) => {
    const keyString = formatStringKey(key);
    map.set(keyString, value);
  });
}

function indexCombinedTuning(cbt: CombinedTuningResource, map: Map<string, string>) {
  cbt.dom.child.children
    .filter(child => child.tag === "R")
    .forEach(rNode => {
      rNode.children.forEach(instanceNode => {
        map.set(instanceNode.id as string, instanceNode.name);
      });
    });
}

function indexTuning(tuning: XmlResource, map: Map<string, string>) {
  map.set(tuning.root.id as string, tuning.root.name);
}
