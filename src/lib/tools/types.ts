/**
 * Shared primitives for tool configs and content.
 * Locked in Session 4 — do not change signatures without opening a new Session.
 */

import type { ActiveLanguage } from '../hreflang';
export type Lang = ActiveLanguage;

export const TOOL_TYPES = [
  'converter',
  'calculator',
  'generator',
  'formatter',
  'validator',
  'analyzer',
  'comparer',
  'file-tool',
  'interactive',
] as const;

export type ToolType = (typeof TOOL_TYPES)[number];

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
