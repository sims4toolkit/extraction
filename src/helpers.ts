import glob from "glob";
import path from "path";
import { BinaryResourceType, StringTableLocale, TuningResourceType } from "@s4tk/models/enums";

// FIXME: replace this with the one being added in @s4tk/models 0.4.3
export function getLocaleCode(locale: StringTableLocale): string {
  switch (locale) {
    case StringTableLocale.English: return "ENG_US";
    case StringTableLocale.ChineseSimplified: return "CHS_CN";
    case StringTableLocale.ChineseTraditional: return "CHT_CN";
    case StringTableLocale.Czech: return "CZE_CZ";
    case StringTableLocale.Danish: return "DAN_DK";
    case StringTableLocale.Dutch: return "DUT_NL";
    case StringTableLocale.Finnish: return "FIN_FI";
    case StringTableLocale.French: return "FRE_FR";
    case StringTableLocale.German: return "GER_DE";
    case StringTableLocale.Italian: return "ITA_IT";
    case StringTableLocale.Japanese: return "JPN_JP";
    case StringTableLocale.Korean: return "KOR_KR";
    case StringTableLocale.Norwegian: return "NOR_NO";
    case StringTableLocale.Polish: return "POL_PL";
    case StringTableLocale.Portuguese: return "POR_BR";
    case StringTableLocale.Russian: return "RUS_RU";
    case StringTableLocale.Spanish: return "SPA_EA";
    case StringTableLocale.Swedish: return "SWE_SE";
    default: return undefined;
  }
}
