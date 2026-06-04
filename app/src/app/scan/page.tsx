import { listManifests } from "@/lib/scan/store";
import { ScanIndexClient } from "./scan-index-client";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const manifests = await listManifests();
  return <ScanIndexClient manifests={manifests} />;
}
