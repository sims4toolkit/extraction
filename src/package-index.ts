import fs from "fs";
import { Package, CombinedTuningResource, StringTableResource, XmlResource } from "@s4tk/models";
import { IndexingOptions } from "./types";
import { BinaryResourceType, StringTableLocale } from "@s4tk/models/enums";
import { formatStringKey } from "@s4tk/hashing/formatting";
import { resourceIsExtractable } from "./helpers";

/**
 * TODO:
 */
export default class PackageIndex {
  /** Maps string keys (as hex strings) to their values. */
  readonly stringMap: Map<string, string>;

  /** Maps tuning IDs (as decimal strings) to their file names. */
  readonly tuningMap: Map<string, string>;

  /** A set of paths to packages that contain tuning and/or SimData. */
  readonly extractablePaths: Set<string>;

  get commentMap(): Map<string, string> {
    const commentMap = new Map<string, string>();
    this.stringMap.forEach((string, key) => commentMap.set(key, string));
    this.tuningMap.forEach((name, id) => commentMap.set(id, name));
    return commentMap;
  }

  constructor(private _options?: IndexingOptions) {
    this.stringMap = new Map();
    this.tuningMap = new Map();
    this.extractablePaths = new Set();
  }

  //#region Public Methods

  /**
   * Reads and indexes a package at the given path.
   * 
   * @param path Path of package to read and index
   */
  readPackage(path: string) {
    let pathAddedToSet = false;
    const addPathToSet = () => {
      this.extractablePaths.add(path);
      pathAddedToSet = true;
    }

    const targetLocale = this._options?.locale ?? StringTableLocale.English;

    const entries = Package.streamResources(path, {
      resourceFilter(type, _, instance) {
        if (resourceIsExtractable(type)) {
          if (!pathAddedToSet) addPathToSet();
          return type !== BinaryResourceType.SimData;
        } else if (type === BinaryResourceType.StringTable) {
          return StringTableLocale.getLocale(instance) === targetLocale;
        }

        return false;
      }
    });

    entries.forEach(({ key, value }, i) => {
      if (key.type === BinaryResourceType.StringTable) {
        this._addStringTable(value as StringTableResource);
      } else if (key.type === BinaryResourceType.CombinedTuning) {
        this._addCombinedTuning(value as CombinedTuningResource);
      } else {
        this._addTuning(value as XmlResource);
      }
    });
  }

  //#endregion Public Methods

  //#region Private Methods

  /**
   * Indexes the tuning resources within combined tuning.
   * 
   * @param combined Combined tuning resource to index
   */
  private _addCombinedTuning(combined: CombinedTuningResource) {
    combined.dom.child.children
      .filter(child => child.tag === "R")
      .forEach(rNode => {
        rNode.children.forEach(instanceNode => {
          this.tuningMap.set(instanceNode.id as string, instanceNode.name);
        });
      });
  }

  /**
  * Indexes the entries in a string table.
  * 
  * @param stbl String table to index
  */
  private _addStringTable(stbl: StringTableResource) {
    stbl.entries.forEach(({ key, value }) => {
      const keyString = formatStringKey(key);
      this.stringMap.set(keyString, value);
    });
  }

  /**
  * Indexes the given tuning resource.
  * 
  * @param tuning Tuning resource to index
  */
  private _addTuning(tuning: XmlResource) {
    this.tuningMap.set(tuning.root.id as string, tuning.root.name);
  }

  //#endregion Private Methods
}
