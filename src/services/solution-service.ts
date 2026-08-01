import { solutions } from "@/data/solutions";
import type { Solution } from "@/types";

export async function listSolutions(): Promise<Solution[]> {
  return solutions;
}

export async function getSolutionBySlug(slug: string): Promise<Solution | undefined> {
  return solutions.find((s) => s.slug === slug);
}
