import http from 'node:http';
import { access } from 'node:fs/promises';

import type { ArtifactDescriptor } from './descriptor.js';
import { sha256OfFile } from './descriptor.js';

export const STARTUP_STATE_SCHEMA_VERSION = 1 as const;

export type StartupIssueCode =
  | 'recovery_failed'
  | 'descriptor_unavailable'
  | 'artifact_missing'
  | 'artifact_hash_mismatch'
  | 'artifact_identity_mismatch'
  | 'artifact_open_failed'
  | 'static_snapshot_missing'
  | 'static_snapshot_incompatible'
  | 'static_snapshot_stale'
  | 'unsupported_case_log_schema'
  | 'unsupported_judgment_log_schema'
  | 'port_occupied';

export interface StartupIssue {
  readonly code: StartupIssueCode;
  readonly area: 'recovery' | 'descriptor' | 'artifact' | 'static' | 'cases' | 'judgments' | 'network';
  readonly message: string;
  readonly remediation: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface StartupState {
  readonly schemaVersion: typeof STARTUP_STATE_SCHEMA_VERSION;
  readonly mode: 'ready' | 'degraded-read-only';
  readonly issues: readonly StartupIssue[];
}

export function startupState(issues: readonly StartupIssue[]): StartupState {
  return {
    schemaVersion: STARTUP_STATE_SCHEMA_VERSION,
    mode: issues.length === 0 ? 'ready' : 'degraded-read-only',
    issues: [...issues],
  };
}

export function issue(
  code: StartupIssueCode,
  area: StartupIssue['area'],
  message: string,
  remediation: string,
  details?: Readonly<Record<string, unknown>>,
): StartupIssue {
  return details === undefined ? { code, area, message, remediation } : { code, area, message, remediation, details };
}

export async function preflightArtifactFile(
  databasePath: string,
  descriptor: ArtifactDescriptor,
): Promise<StartupIssue | null> {
  try {
    await access(databasePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return issue(
      'artifact_missing',
      'artifact',
      `Reviewed artifact is missing: ${databasePath}.`,
      'Run `npm run fetch-artifact --workspace workbench`, then restart the workbench.',
      { path: databasePath },
    );
  }
  const actualSha256 = await sha256OfFile(databasePath);
  if (actualSha256 !== descriptor.databaseSha256) {
    return issue(
      'artifact_hash_mismatch',
      'artifact',
      'Reviewed artifact SHA-256 does not match the release descriptor.',
      'Remove the local artifact, run `npm run fetch-artifact --workspace workbench`, then restart.',
      { path: databasePath, expectedSha256: descriptor.databaseSha256, actualSha256 },
    );
  }
  return null;
}

export async function preflightLog(
  kind: 'case' | 'judgment',
  logPath: string,
  readAndValidate: () => Promise<unknown>,
): Promise<StartupIssue | null> {
  try {
    await readAndValidate();
    return null;
  } catch (error) {
    const code = kind === 'case' ? 'unsupported_case_log_schema' : 'unsupported_judgment_log_schema';
    const label = kind === 'case' ? 'Case' : 'Judgment';
    return issue(
      code,
      kind === 'case' ? 'cases' : 'judgments',
      `${label} log is not supported by this workbench: ${error instanceof Error ? error.message : 'unknown validation error'}`,
      `Back up ${logPath}, repair or migrate the JSONL log, then restart the workbench.`,
      { path: logPath },
    );
  }
}

export class StartupListenError extends Error {
  constructor(readonly startupIssue: StartupIssue) {
    super(startupIssue.message);
    this.name = 'StartupListenError';
  }
}

/** Resolves only after the loopback listener is live and classifies bind failures. */
export function listenOnLoopback(server: http.Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException): void => {
      server.off('listening', onListening);
      if (error.code === 'EADDRINUSE') {
        reject(new StartupListenError(issue(
          'port_occupied',
          'network',
          `Workbench port ${port} on 127.0.0.1 is already in use.`,
          'Stop the existing process or set WORKBENCH_PORT to an unused port, then restart.',
          { host: '127.0.0.1', port },
        )));
        return;
      }
      reject(error);
    };
    const onListening = (): void => {
      server.off('error', onError);
      const address = server.address();
      resolve(typeof address === 'object' && address !== null ? address.port : port);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

export function startupFailureJson(error: StartupListenError): string {
  return JSON.stringify({
    schema: 'scripture-workbench/startup-failure/v1',
    state: 'startup-failed',
    issue: error.startupIssue,
  });
}
