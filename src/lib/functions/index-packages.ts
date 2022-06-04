import { Package } from "@s4tk/models";
import { BinaryResourceType } from "@s4tk/models/enums";
import type { ResourcePosition } from "@s4tk/models/types";
import type { FileMap, PackagePaths, SimulationIndex } from "../types";

/**
 * Indexes all of the Combined Tuning and SimData in the packages at the given
 * file paths.
 * 
 * @param filepaths Absolute paths of packages to index
 */
export function indexSimulationPackages(filepaths: PackagePaths): SimulationIndex {
  const latestCombineds = new Map<number, PathAndPosition>();
  const latestSimDatas = new Map<bigint, PathAndPosition>();

  const indexPackage = (filepath: string) => {
    const resources = Package.indexResources(filepath, {
      resourceFilter(type, group, instance) {
        return (type === BinaryResourceType.CombinedTuning
          || type === BinaryResourceType.SimData);
      }
    });

    resources.forEach(position => {
      if (position.key.type === BinaryResourceType.CombinedTuning) {
        latestCombineds.set(position.key.group, { filepath, position });
      } else {
        latestSimDatas.set(position.key.instance, { filepath, position });
      }
    });
  };

  filepaths.source.forEach(indexPackage);
  filepaths.delta.forEach(indexPackage);

  return {
    combined: createFileMap(latestCombineds),
    simdata: createFileMap(latestSimDatas)
  };
}

/**
 * Indexes all of the string tables in the packages at the given file paths.
 * 
 * @param filepaths Absolute paths of packages to index
 */
export function indexStringTablePackages(filepaths: PackagePaths): FileMap {
  const latestStbls = new Map<bigint, PathAndPosition>();

  const indexPackage = (filepath: string) => {
    Package.indexResources(filepath, {
      resourceFilter(type) {
        return type === BinaryResourceType.StringTable;
      }
    }).forEach(position => {
      latestStbls.set(position.key.instance, { filepath, position });
    });
  };

  filepaths.source.forEach(indexPackage);
  filepaths.delta.forEach(indexPackage);

  return createFileMap(latestStbls);
}

//#region Types

interface PathAndPosition {
  filepath: string;
  position: ResourcePosition;
}

//#endregion Types

//#region Helpers

function createFileMap(map: Map<any, PathAndPosition>): FileMap {
  const fileMap: FileMap = new Map();

  map.forEach(({ filepath, position }) => {
    if (fileMap.has(filepath)) {
      fileMap.get(filepath).push(position);
    } else {
      fileMap.set(filepath, [position]);
    }
  });

  return fileMap;
}

//#endregion Helpers