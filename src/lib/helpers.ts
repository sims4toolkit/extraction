import path from "path";
import { sync as globSync } from "glob";

/**
 * Returns a list of filepaths that can be read with FS on this OS.
 * 
 * @param base Absolute base of glob path
 * @param segments Segments to add to path
 */
export function safeGlob(base: string, ...segments: string[]): string[] {
  return globSync(path.join(base, ...segments)
    .replace(/\\/g, "/")) // glob requires "/", even on Windows
    .map(p => path.normalize(p)); // convert back to "\" if needed
}
