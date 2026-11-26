// news-image-20261125 entry (v3, revised): a modern briefing poster summing
// up Wednesday 25 November 2026, shipped as entry.png beside this file.
//
// The entry program is a deterministic publisher: it copies the bundled
// image to the grader's output directory, unchanged, byte for byte. It
// performs no I/O beyond that copy, makes no network calls, reads no
// clock and no randomness, so repeated runs always produce identical
// bytes. Node 22, standard library only.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** PNG signature: the first eight bytes every valid PNG must carry. */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

interface PublishConfig {
  /** Directory the grader reads the entry image from. */
  outputDir: string;
  /** Image file bundled in this repo. */
  assetName: string;
}

/** Resolve where the entry image has to land. Outside the grader's
 *  container MAKEFUN_OUTPUT_DIR stands in for /output. */
function loadConfig(): PublishConfig {
  return {
    outputDir: process.env.MAKEFUN_OUTPUT_DIR ?? '/output',
    assetName: 'entry.png',
  };
}

/** Absolute path of the directory holding this module. */
function moduleDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

/** Fail loudly, before copying anything, if the bundled asset is
 *  missing or is not a PNG at all. */
function assertBundledImage(assetPath: string): void {
  if (!existsSync(assetPath)) {
    throw new Error(`bundled image missing: ${assetPath}`);
  }
  const head = readFileSync(assetPath).subarray(0, PNG_SIGNATURE.length);
  if (!head.equals(PNG_SIGNATURE)) {
    throw new Error(`bundled image is not a PNG: ${assetPath}`);
  }
}

/** Copy the bundled image to <outputDir>/entry.png, byte for byte. */
function publish(config: PublishConfig): string {
  const assetPath = resolve(join(moduleDir(), config.assetName));
  assertBundledImage(assetPath);
  mkdirSync(config.outputDir, { recursive: true });
  const destination = join(resolve(config.outputDir), config.assetName);
  copyFileSync(assetPath, destination);
  return destination;
}

publish(loadConfig());
