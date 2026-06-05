import { getLibrary } from "@/db/knowledge-repo";
import { KnowledgeClient } from "./knowledge-client";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const library = await getLibrary();
  return <KnowledgeClient library={library} />;
}
