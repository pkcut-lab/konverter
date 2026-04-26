/**
 * Categorical proximity scoring for internal linking.
 *
 * Computes a ranked list of related tools based on:
 *  - category match (weight 3) — same category group (e.g., 'length', 'finance')
 *
 * Symmetry guarantee: if A scores B ≥ 1, B scores A ≥ 1 (both share category),
 * so computeRelatedTools(A) ∋ B ↔ computeRelatedTools(B) ∋ A.
 *
 * Intentionally pure (no async, no side-effects) so it's unit-testable.
 */
import type { ToolListItem } from './tools/list';

export function computeRelatedTools(
  currentToolId: string,
  currentCategory: string | undefined,
  all: ToolListItem[],
  maxCount = 5,
): ToolListItem[] {
  if (!currentCategory) return [];

  return all
    .filter((t) => t.toolId !== currentToolId && t.category === currentCategory)
    .slice(0, maxCount);
}
