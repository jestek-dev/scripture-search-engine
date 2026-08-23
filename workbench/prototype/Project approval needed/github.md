repo: jestek-dev/scripture-search-engine
branch: main

## Last sync
date: 2026-08-21T13:53:19Z

### Updated in this project
- Read workbench UI source to ground the redesign (verdict actions, case sources/states, interview logic, demotion copy)
- Built "Curation Workbench" redesign prototype ("The Study" direction)

## Screen map
| Screen | Repo files |
|---|---|
| Review (queue, verse panel, verdicts, interview, missing passage) | workbench/static/index.html, workbench/src/judgments.ts, workbench/src/inbox.ts, workbench/src/reviewCases.ts, workbench/src/diagnosticRouter.ts |
| Compare | workbench/src/blindComparison.ts, workbench/static/index.html |
| History | workbench/src/cases.ts, workbench/src/judgments.ts |
| Finish up (compile + signing) | workbench/src/compileJudgments.ts, workbench/src/fixturePromotion.ts |
| Advanced | workbench/src/health.ts, workbench/src/jobRunner.ts, workbench/src/admission.ts, workbench/src/publishPreparation.ts, workbench/src/qualityDashboard.ts, workbench/src/telemetryAudit.ts |
