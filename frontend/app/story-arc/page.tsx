import { Persona } from "@/lib/context";
import StoryArcPageClient from "./StoryArcPageClient";

type StoryArcPageProps = {
  searchParams?: Promise<{
    articleId?: string;
    persona?: string;
  }>;
};

function normalizePersona(value?: string): Persona | undefined {
  if (value === "general" || value === "investor" || value === "founder" || value === "student") {
    return value;
  }
  return undefined;
}

export default async function StoryArcPage({ searchParams }: StoryArcPageProps) {
  const params = (await searchParams) ?? {};
  return (
    <StoryArcPageClient
      initialArticleId={params.articleId}
      initialPersona={normalizePersona(params.persona)}
    />
  );
}
