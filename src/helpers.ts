import { BinaryResourceType, TuningResourceType } from "@s4tk/models/enums";
import glob from "glob";
import path from "path";

/**
 * TODO:
 * 
 * @param dirs TODO:
 */
export function locatePackages(dirs: string[]): string[] {
  const paths: string[] = [];

  dirs.forEach(dir => {
    paths.push(...glob.sync(path.join(dir, "**", "*.package")));
  });

  return paths;
}

/**
 * TODO:
 * 
 * @param type TODO:
 */
export function resourceIsExtractable(type: number): boolean {
  return type === BinaryResourceType.CombinedTuning
    || type === BinaryResourceType.SimData
    || (type in TuningResourceType);
}

/**
 * Maps tuning names to their enum value.
 * 
 * Credit: This function was created by Lot51.
 * 
 * @param instanceName Name of tuning type as it appears in the 'i' attribute
 */
export function getInstanceType(instanceName = "tuning"): TuningResourceType {
  // FIXME: this probably doesn't work with TuningResourceType lol
  switch (instanceName) {
    case "relbit":
      instanceName = "relationship_bit";
      break;
    case "scommodity":
      instanceName = "static_commodity";
      break;
    case "career_situation":
      instanceName = "situation";
      break;
    case "achievement_reward":
      instanceName = "reward";
      break;
    case "Automation":
    case "BuildBuy":
    case "NativeBuildBuy":
    case "Native_SeasonsWeather":
    case "HsvTweakerSettings":
    case "Video_Playlist":
    case "Video_GlobalTuning":
    case "Renderer_GlobalDofSettings":
    case "Renderer_CensorTuning":
    case "Renderer_FadeTuning":
    case "Renderer_GlobalLightSettings":
    case "Renderer_GlobalShadowSettings":
    case "Renderer_GlobalHighlightSettings":
    case "Renderer_GlobalSsaoSettings":
    case "Renderer_GlobalVolLightScatteringSettings":
    case "RegionSort":
    case "Telemetry_MemoryUsageTelemetrySettings":
    case "Telemetry_Tuning":
    case "Thumbnail":
    case "camera":
    case "cascameratuning":
    case "casocculttuning":
    case "casoccultskintonetuning":
    case "caslighting":
    case "castuning":
    case "casthumbnailparttuning":
    case "casmodifiertuning":
    case "client_tutorial":
    case "maxis_lot":
    case "simlighting":
    case "tagsmetadata":
    case "tagcategoriesmetadata":
    case "tagstraitgroupmetadata":
    case "tagtuning":
      instanceName = "tuning";
  }

  return TuningResourceType[instanceName.toUpperCase()] ?? TuningResourceType.Tuning;
}
