import glob from "glob";
import path from "path";

/**
 * TODO:
 * 
 * @param dirs TODO:
 */
export default function locatePackages(dirs: string[]): string[] {
  const paths: string[] = [];

  dirs.forEach(dir => {
    paths.push(...glob.sync(path.join(dir, "**", "*.package")));
  });

  return paths;
}
