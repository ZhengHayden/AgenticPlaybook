/**
 * Geographic-region taxonomy offered by the Opportunity Scanning wizard and the
 * Benchmark Setting page. Mirrors {@link IndustrySector} in `sectors.ts`: a list
 * of presets plus the `OTHER_REGION` sentinel that reveals a free-text input.
 *
 * The stored `ScanModel.region` is always a display label (a preset `label` or
 * the user's custom text), never the sentinel — so downstream rendering is plain.
 * Region pairs with sector to select the labor-rate & automation benchmark defaults.
 */

export interface Region {
  /** Stable code selected in the UI (not persisted on the model itself). */
  code: string;
  /** Human-readable label persisted on `ScanModel.region`. */
  label: string;
}

/** Sentinel selection that reveals the free-text region input. */
export const OTHER_REGION = "OTHER";

export const REGIONS: Region[] = [
  { code: "NAM", label: "North America" },
  { code: "EU", label: "Europe" },
  { code: "GC", label: "Greater China" },
  { code: "APAC", label: "Asia-Pacific (ex-China)" },
  { code: "LATAM", label: "Latin America" },
  { code: "MEA", label: "Middle East & Africa" },
];
