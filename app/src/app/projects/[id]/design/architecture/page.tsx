import { redirect } from "next/navigation";

interface ArchitecturePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w?: string }>;
}

/**
 * The Architecture tab is hidden from the Design phase. Any direct or
 * bookmarked navigation is redirected back to the Workflow tab, preserving the
 * selected workflow (`?w`).
 */
export default async function ArchitecturePage({ params, searchParams }: ArchitecturePageProps) {
  const { id } = await params;
  const { w } = await searchParams;
  const query = w ? `?w=${w}` : "";
  redirect(`/projects/${id}/design/workflow${query}`);
}
