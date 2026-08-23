// Embedding runner for the offline curation tooling (P4.16 / B4).
//
// Loads ONLY the locked model (model.lock.json), ONLY from the local
// verified copy — remote loading is disabled outright, and a missing or
// mismatched local copy throws before any inference runs. Embeddings are
// working data for a human reviewer; they are never written anywhere the
// pipeline or engine reads.
import { join } from 'node:path';

import { env, pipeline } from '@xenova/transformers';

import { CURATION_ROOT, readModelLock, verifyLocalModel, type ModelLock } from './modelLock.js';

export interface Embedder {
  readonly lock: ModelLock;
  embed(texts: readonly string[]): Promise<number[][]>;
}

export async function createEmbedder(): Promise<Embedder> {
  const lock = readModelLock();
  const verification = verifyLocalModel(lock);
  if (verification.status !== 'verified') {
    throw new Error(`model not usable: ${verification.reason}`);
  }

  // Local, pinned, offline: no remote models, no implicit cache writes.
  env.allowRemoteModels = false;
  env.localModelPath = join(CURATION_ROOT, '.models');
  const extractor = await pipeline('feature-extraction', lock.pinned.repo, { quantized: true });

  return {
    lock,
    async embed(texts: readonly string[]): Promise<number[][]> {
      const vectors: number[][] = [];
      const batchSize = 32;
      for (let start = 0; start < texts.length; start += batchSize) {
        const batch = texts.slice(start, start + batchSize);
        const output = await extractor([...batch], { pooling: 'mean', normalize: true });
        const [rows, dims] = output.dims as [number, number];
        const data = output.data as Float32Array;
        for (let row = 0; row < rows; row += 1) {
          vectors.push(Array.from(data.subarray(row * dims, (row + 1) * dims)));
        }
      }
      return vectors;
    },
  };
}

/** Cosine similarity; inputs are already L2-normalized by the embedder. */
export function cosine(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += (a[i] as number) * (b[i] as number);
  return dot;
}

/** Element-wise mean of L2-normalized vectors, re-normalized. */
export function meanVector(vectors: readonly (readonly number[])[]): number[] {
  const first = vectors[0];
  if (!first) throw new Error('meanVector requires at least one vector');
  const out = new Array<number>(first.length).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < vector.length; i += 1) out[i] = (out[i] as number) + (vector[i] as number);
  }
  let norm = 0;
  for (let i = 0; i < out.length; i += 1) {
    out[i] = (out[i] as number) / vectors.length;
    norm += (out[i] as number) * (out[i] as number);
  }
  norm = Math.sqrt(norm);
  for (let i = 0; i < out.length; i += 1) out[i] = (out[i] as number) / norm;
  return out;
}
