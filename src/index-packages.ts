import { Package } from "@s4tk/models";
import { BinaryResourceType } from "@s4tk/models/enums";
import type { ResourceKey, ResourcePosition } from "@s4tk/models/types";
import type { PackagePaths } from "./types";

interface PathAndPosition {
  filepath: string;
  position: ResourcePosition;
}

type FileMap = Map<string, ResourcePosition[]>;

interface SimulationIndex {
  combined: FileMap;
  simdata: FileMap;
}

/**
 * TODO:
 * 
 * @param filepaths TODO:
 */
export function indexSimulationFiles(filepaths: PackagePaths): SimulationIndex {
  const latestCombineds = new Map<number, PathAndPosition>();
  const latestSimDatas = new Map<bigint, PathAndPosition>();

  const indexPackage = (filepath: string) => {
    const keys: (number | bigint)[] = [];

    Package.indexResources(filepath, {
      resourceFilter(type, group, instance) {
        if (type === BinaryResourceType.CombinedTuning) {
          keys.push(group);
          return true;
        } else if (type === BinaryResourceType.SimData) {
          keys.push(instance);
          return true;
        } else {
          return false;
        }
      }
    }).forEach((position, i) => {
      const key = keys[i];
      if (typeof key === "number") {
        latestCombineds.set(key, { filepath, position });
      } else {
        latestSimDatas.set(key, { filepath, position });
      }
    });
  };

  filepaths.source.forEach(indexPackage);
  filepaths.delta.forEach(indexPackage);

  const createFileMap = (map: Map<any, PathAndPosition>): FileMap => {
    const fileMap: FileMap = new Map();

    map.forEach(({ filepath, position }) => {
      if (fileMap.has(filepath)) {
        fileMap.get(filepath).push(position);
      } else {
        fileMap.set(filepath, [position]);
      }
    });

    return fileMap;
  };

  return {
    combined: createFileMap(latestCombineds),
    simdata: createFileMap(latestSimDatas)
  };
}
