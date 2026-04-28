import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyMlMirrorIfConfigured, getMirrorHost } from '../../../src/lib/tools/ml-mirror';

describe('ml-mirror', () => {
  beforeEach(() => {
    delete (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__;
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    delete (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__;
    vi.unstubAllGlobals();
  });

  describe('getMirrorHost', () => {
    it('returns null when nothing is configured', () => {
      expect(getMirrorHost()).toBe(null);
    });

    it('returns the runtime override when window-flag is set', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'https://models.kittokit.tld';
      expect(getMirrorHost()).toBe('https://models.kittokit.tld');
    });

    it('rejects http:// (not https)', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'http://models.kittokit.tld';
      expect(getMirrorHost()).toBe(null);
    });

    it('rejects trailing slash', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'https://models.kittokit.tld/';
      expect(getMirrorHost()).toBe(null);
    });

    it('rejects the HF default host (no-op misconfig)', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'https://huggingface.co';
      expect(getMirrorHost()).toBe(null);
    });

    it('rejects empty string', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ = '';
      expect(getMirrorHost()).toBe(null);
    });
  });

  describe('applyMlMirrorIfConfigured', () => {
    it('is a no-op when nothing is configured', () => {
      const env: { remoteHost: string } = { remoteHost: 'https://huggingface.co' };
      const result = applyMlMirrorIfConfigured(env);
      expect(result.mirrored).toBe(false);
      expect(result.host).toBe(null);
      expect(env.remoteHost).toBe('https://huggingface.co');
    });

    it('writes the mirror host into env when configured', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'https://models.kittokit.tld';
      const env: { remoteHost: string } = { remoteHost: 'https://huggingface.co' };
      const result = applyMlMirrorIfConfigured(env);
      expect(result.mirrored).toBe(true);
      expect(result.host).toBe('https://models.kittokit.tld');
      expect(env.remoteHost).toBe('https://models.kittokit.tld');
    });

    it('is idempotent when called twice with the same env', () => {
      (window as Window & { __KITTOKIT_ML_MIRROR_HOST__?: string }).__KITTOKIT_ML_MIRROR_HOST__ =
        'https://models.kittokit.tld';
      const env: { remoteHost: string } = { remoteHost: 'https://huggingface.co' };
      applyMlMirrorIfConfigured(env);
      applyMlMirrorIfConfigured(env);
      expect(env.remoteHost).toBe('https://models.kittokit.tld');
    });
  });
});
