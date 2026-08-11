# Workbench v1.5 Recovery

This runbook covers the private, localhost-only `workbench` workspace. The
workbench serves the artifact named by `artifacts/content-artifact.json` and
opens the database read-only. Its local review state is separate from the
artifact.

## Normal restart

Install the locked workspaces and fetch the reviewed artifact with:

```powershell
npm ci
npm run fetch-artifact --workspace workbench
```

Stop the server normally and start it again with:

```powershell
npm run serve --workspace workbench
```

Startup first attempts to recover mutation journals under
`workbench/.state/journals`. It then re-checks the descriptor, artifact hash,
and engine identities. A restart is the normal recovery action after an
interrupted compile apply or fixture promotion. After startup, open
`http://127.0.0.1:8787/api/v2/health` or the Health view and check:

- `startup.degraded` is `false`;
- descriptor and artifact identities are aligned;
- the gauntlet report is fresh for this checkout; and
- no journal or mutation error is reported.

The top-level health statuses mean:

| Status | Meaning |
|---|---|
| `healthy` | Descriptor, reviewed artifact, identities, and an exact-`ADMIT` report align. |
| `stale` | The checkout is readable, but a judgment, fixture, coverage item, descriptor note, or report is not current. |
| `running` | An identity-bound gauntlet check is active. |
| `rejected` | A gate or identity check blocks admission. |
| `unavailable` | Startup, artifact, descriptor, report, git, static page, or required log data could not be read. |

Create a fresh UI preview after any restart or failed apply. A preview digest
is intentionally invalid once its observed inputs change.

## Interrupted journal operations

Compile apply and fixture promotion use a journal and a repository lock. The
state is stored only in these ignored paths:

```text
workbench/.state/journals/<operation-id>.json
workbench/.state/journals/<operation-id>.staging/
workbench/.state/journals/<operation-id>.backups/
workbench/.state/locks/mutation-apply.lock
```

Recovery is all-before or all-after. A prepared journal is kept at the
pre-operation state. A committing or committed journal is completed only when
the staged bytes, backups, target preconditions, and final hashes agree. If
those checks cannot prove a safe outcome, recovery fails closed and leaves the
state for diagnosis. Do not edit, rename, or delete a journal, staging
directory, backup, or target file by hand.

The server records a recovery failure in startup diagnostics and starts in
degraded read-only mode. Inspect the health response, preserve the reported
operation id and error, and escalate the conflict rather than guessing which
files to restore.

## Busy or stale locks

Only one repository mutation or fixed repository check may run at a time. A
valid lock records `ownerId`, `pid`, and `createdAtMs`. A live owner is busy;
wait for that server/check to finish. If the recorded process is gone, the
next operation can reclaim the lock. An invalid regular lock is reclaimable
only after it has been stale for at least five minutes. The reclaim is done by
the journal code, not by a manual delete.

Use these non-destructive diagnostics from the repository root:

```powershell
Get-ChildItem workbench/.state -Force -Recurse -ErrorAction SilentlyContinue |
  Select-Object FullName, Length, LastWriteTime
Get-Content -Raw workbench/.state/locks/mutation-apply.lock -ErrorAction SilentlyContinue
Get-Process -Id <pid> -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, StartTime
```

If the owner process is live, do not start a second server or check. If it is
not live, restart the workbench and retry the UI operation. If the lock remains
busy or its owner record is malformed, keep the files intact and report the
lock error with the PID, timestamps, and operation id.

## Malformed cases or judgment logs

`workbench/judgments.jsonl` and `workbench/cases.jsonl` are append-only local
history. The compiler validates every non-empty line and rejects invalid JSON,
invalid record shape, duplicate v2 judgment ids, broken supersession links,
and case/query mismatches. Startup preflight rejects a torn or malformed line
and enters degraded read-only mode. Do not remove a bad line or rewrite the
history to make the preview pass.

An unsupported log schema intentionally replaces the normal UI with the
read-only fallback and makes compile preview return
`503 startup_degraded_read_only`. Inspect `/api/v2/health` for the affected
path and schema code, preserve the original log, and use these read-only JSON
syntax diagnostics:

```powershell
$line = 0
Get-Content workbench/judgments.jsonl -ErrorAction SilentlyContinue |
  ForEach-Object {
    $line++
    if ($_.Trim()) {
      try {
        $_ | ConvertFrom-Json -ErrorAction Stop | Out-Null
        "OK line $line"
      } catch {
        "INVALID line ${line}: $($_.Exception.Message)"
      }
    }
  }

$line = 0
Get-Content workbench/cases.jsonl -ErrorAction SilentlyContinue |
  ForEach-Object {
    $line++
    if ($_.Trim()) {
      try {
        $_ | ConvertFrom-Json -ErrorAction Stop | Out-Null
        "OK line $line"
      } catch {
        "INVALID line ${line}: $($_.Exception.Message)"
      }
    }
  }

Get-Content -Raw workbench/legacy/migration-manifest.json -ErrorAction SilentlyContinue |
  ConvertFrom-Json -ErrorAction Stop | Out-Null
```

These commands check JSON syntax only. A successful parse is not schema
approval. After a reviewed repair or migration has restored a supported log,
restart the server and use **Changes > Preview fixture changes** for the
authoritative compiler validation. Keep the original logs unchanged until
that reviewed recovery is available, and retain the exact health issue, line
number, and current artifact identities for follow-up.

## Degraded startup

The server remains inspectable but read-only when it cannot establish a
trusted review session. Common causes are:

- missing or malformed `artifacts/content-artifact.json`;
- missing `workbench/.artifact/content.db`;
- an artifact SHA-256 mismatch;
- an engine identity mismatch;
- static UI or journal recovery failure.

In degraded mode the fallback page points to `/api/v2/health`; review,
judgment, compile-apply, and promotion writes are refused. Do not serve a
database with a hash mismatch. Re-run the verified fetch when the artifact is
missing or mismatched:

```powershell
npm run fetch-artifact --workspace workbench
```

An occupied port prevents the HTTP server from binding; it is not a degraded
health state. Inspect it without terminating anything and use a different local
port in a new terminal:

```powershell
Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
$env:WORKBENCH_PORT = '8788'
npm run serve --workspace workbench
```

The static page is snapshotted at server startup. Restart after changing the
checkout so the page and validator come from the same revision.

## Exact workflow commands

Use these read-only query commands while the server is running:

```powershell
Invoke-RestMethod 'http://127.0.0.1:8787/api/search?q=hearing%20and%20doing'
Invoke-RestMethod 'http://127.0.0.1:8787/api/passage?ref=James%201%3A22-25'
Invoke-RestMethod 'http://127.0.0.1:8787/api/v2/context?ref=James%201%3A22-25'
```

For human review, use **New review case**, select **Create case**, then use
**Start review** and record a judgment. **History** handles reconfirmation or
correction. **Inbox** is the next-case queue. These actions append case and
judgment records; they do not rewrite prior records.

The Changes view is the authoritative compile/check/promote sequence:

1. **Preview fixture changes**, review the exact file diff, checklist, and
   digest, then **Apply fixture changes** with that full digest.
2. Run **Gauntlet** or **Full verify** from Changes. The fixed job ids are
   `typecheck`, `test`, `gauntlet`, and `verify`.
3. For a pending fixture named by a fresh passing report, **Preview
   promotion**, review the status-only diff and evidence, then **Promote
   fixture** with the full promotion digest.

The CLI equivalents are:

```powershell
npm run compile-judgments --workspace workbench
npm run typecheck
npm test
npm run gauntlet:report
npm run verify -- --require-admit
```

The CLI compiler uses the same planning/apply functions as the UI and writes
fixture changes only after its plan has been validated. `gauntlet:report`
writes `eval/.runs/gauntlet-report.json`; `--require-admit` rejects every
verdict other than exact `ADMIT`.

For API-level contract checks, the preview response supplies the digest needed
by the matching apply request:

```powershell
$compile = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/v2/compile/preview' -ContentType 'application/json' -Body '{}'
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/v2/compile/apply' -ContentType 'application/json' -Body (@{ digest = $compile.data.plan.digest } | ConvertTo-Json)

Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/v2/checks' -ContentType 'application/json' -Body (@{ jobId = 'verify' } | ConvertTo-Json)

$promotion = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/v2/fixtures/<fixture-id>/promotion/preview' -ContentType 'application/json' -Body '{}'
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/v2/fixtures/<fixture-id>/promotion/apply' -ContentType 'application/json' -Body (@{ digest = $promotion.data.plan.digest } | ConvertTo-Json)
```

Replace `<fixture-id>` with the actual lowercase fixture id and review the
returned plan before each apply. A changed checkout, judgment log, report, or
fixture makes the old digest stale and requires a new preview.

## Safe diagnostic checklist

The following commands read state only:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/v2/health |
  ConvertTo-Json -Depth 12
git status --short --branch
Get-FileHash artifacts/content-artifact.json -Algorithm SHA256
Get-Item workbench/.artifact/content.db -ErrorAction SilentlyContinue |
  Select-Object FullName, Length, LastWriteTime
Get-ChildItem eval/.runs -Force -ErrorAction SilentlyContinue |
  Select-Object Name, Length, LastWriteTime
```

Do not use `Remove-Item`, `del`, `git clean`, reset/checkout commands, force
termination, manual log rewriting, baseline updates, or remote/git commands
as a recovery shortcut. v1.5 UI actions cannot change ontology, budgets,
engine source, commits, or remotes. Human repository review remains
responsible for any later authored source change, commit, push, or release.
