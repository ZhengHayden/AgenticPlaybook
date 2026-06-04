/**
 * Industry-sector taxonomy offered by the Opportunity Scanning wizard. Codes
 * mirror the common consulting practice areas; the `OTHER_SECTOR` sentinel lets
 * the user type a free-text sector not in the list.
 *
 * The stored `ScanModel.sector` is always a display label (a preset `label` or
 * the user's custom text), never the sentinel — so downstream rendering is plain.
 */

export interface IndustrySector {
  /** Stable code stored/selected in the UI (not persisted on the model itself). */
  code: string;
  /** Human-readable label persisted on `ScanModel.sector`. */
  label: string;
}

/** Sentinel selection that reveals the free-text sector input. */
export const OTHER_SECTOR = "OTHER";

export const INDUSTRY_SECTORS: IndustrySector[] = [
  { code: "GEM", label: "GEM (Global Energy & Materials)" },
  { code: "TMT", label: "TMT (Technology, Media & Telecom)" },
  { code: "FS", label: "Financial Services" },
  { code: "AI", label: "Advanced Industries / Manufacturing" },
  { code: "CR", label: "Consumer & Retail" },
  { code: "HLS", label: "Healthcare & Life Sciences" },
  { code: "PS", label: "Public Sector" },
];
