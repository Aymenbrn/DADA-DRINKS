import type { MDXComponents } from "mdx/types";

/** Composants utilisés pour afficher le texte des actualités (MDX) : rendu HTML standard, mis en forme par .prose */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
