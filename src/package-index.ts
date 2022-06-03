import fs from "fs";
import { CombinedTuningResource, Package, StringTableResource, XmlResource } from "@s4tk/models";
import { IndexingOptions } from "./types";
import { BinaryResourceType, StringTableLocale, TuningResourceType } from "@s4tk/models/enums";
import { formatStringKey } from "@s4tk/hashing/formatting";

/**
 * TODO:
 */
export default class PackageIndex {
  /** Maps string keys (as hex strings) to their values. */
  readonly stringMap: Map<string, string>;

  /** Maps tuning IDs (as decimal strings) to their file names. */
  readonly tuningMap: Map<string, string>;

  /** Keeps track of which paths lead to packages containing combined tuning. */
  readonly combinedTuningPaths: string[];

  /** Locale of string tables to load. */
  readonly targetLocale: StringTableLocale;

  get commentMap(): Map<string, string> {
    const commentMap = new Map<string, string>();
    this.stringMap.forEach((string, key) => commentMap.set(key, string));
    this.tuningMap.forEach((name, id) => commentMap.set(id, name));
    return commentMap;
  }

  constructor(options?: IndexingOptions) {
    this.stringMap = new Map();
    this.tuningMap = new Map();
    this.combinedTuningPaths = [];
    this.targetLocale = options?.locale ?? StringTableLocale.English;
  }

  //#region Public Methods

  /**
   * Reads and indexes a package at the given path.
   * 
   * @param path Path of package to read and index
   */
  readPackage(path: string) {
    const buffer = fs.readFileSync(path);

    const entries = Package.extractResources(buffer, {
      resourceFilter(type, _, instance) {
        if (type === BinaryResourceType.CombinedTuning || (type in TuningResourceType)) {
          return true;
        } else if (type === BinaryResourceType.StringTable) {
          return StringTableLocale.getLocale(instance) === this._targetLocale;
        } else {
          return false;
        }
      }
    });

    entries.forEach(({ key, value }, i) => {
      if (key.type === BinaryResourceType.StringTable) {
        this._addStringTable(value as StringTableResource);
      } else if (key.type === BinaryResourceType.CombinedTuning) {
        this.combinedTuningPaths.push(path);
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
