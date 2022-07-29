import { registerPlugin } from "@s4tk/models/plugins";
import BufferFromFile from "@s4tk/plugin-bufferfromfile";
import { extractFiles } from "./lib/extract-files";
import { loadStringMap, loadTuningMap } from "./lib/memory-loaders";
import type { ExtractionOptions } from "./lib/options";

registerPlugin(BufferFromFile);

export {
  extractFiles,
  loadStringMap,
  loadTuningMap,
  ExtractionOptions,
};
