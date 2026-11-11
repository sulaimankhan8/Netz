# NETZ docs

Last reorganised 2026-11-10. Each area has one doc that holds its current status. It is listed first and marked **status**. The other docs in an area are plans or reports; each records its own progress.

Paths in the docs are written from the project root, for example `docs/launch/NETZ_OWNER_TODO.md`.

## Start here

| Doc | Read it for |
|---|---|
| [launch/NETZ_ROADMAP.md](launch/NETZ_ROADMAP.md) | **Status.** What gets built when, from now to launch and after |
| [launch/NETZ_OWNER_TODO.md](launch/NETZ_OWNER_TODO.md) | Everything only the owner can do (accounts, keys, money, decisions), in order |
| [playground/PLAYGROUND_HANDOFF.md](playground/PLAYGROUND_HANDOFF.md) | Playground rules, code map, how to run every check, work queue |
| [methods/METHODS_IMPLEMENTATION_PLAN.md](methods/METHODS_IMPLEMENTATION_PLAN.md) | How method pages are built, and progress through the batches |

## launch/: going live

| Doc | What it is |
|---|---|
| [NETZ_ROADMAP.md](launch/NETZ_ROADMAP.md) | **Status.** Roadmap from today to launch and growth (F items for findability) |
| [NETZ_OWNER_TODO.md](launch/NETZ_OWNER_TODO.md) | The owner's to-do list |
| [NETZ_LAUNCH_PLAN.md](launch/NETZ_LAUNCH_PLAN.md) | Tasks, streaks, gems, art, backend, pricing and ads: the rules |
| [NETZ_LAUNCH_CHECKS.md](launch/NETZ_LAUNCH_CHECKS.md) | Results of the launch checks against a production build |
| [NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md](launch/NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md) | For later: moving from Vercel to the Lightsail server |

## methods/: method pages and calculators

| Doc | What it is |
|---|---|
| [METHODS_IMPLEMENTATION_PLAN.md](methods/METHODS_IMPLEMENTATION_PLAN.md) | **Status.** How to build the new methods, batch by batch, with progress |
| [NETZ_METHODS_CATALOG.md](methods/NETZ_METHODS_CATALOG.md) | Every method and unit to add, and what every page needs |
| [METHOD_PAGES_WORST_CASE_REPORT.md](methods/METHOD_PAGES_WORST_CASE_REPORT.md) | Worst-case inputs on the method pages (all 15 findings fixed) |
| [ALGORITHM_STEPS_AUDIT.md](methods/ALGORITHM_STEPS_AUDIT.md) | Audit of the steps shown on the first 34 pages (fixed 2026-10-18) |

## rewards/: tasks, medals and gems

| Doc | What it is |
|---|---|
| [NETZ_MEDALS_CATALOG.md](rewards/NETZ_MEDALS_CATALOG.md) | **Status.** Every task and medal with its design, including the per-page unit medals |
| [NETZ_TASK_SHEET.md](rewards/NETZ_TASK_SHEET.md) | One-page summary of how tasks, streaks and gems work |

## playground/: the handwriting whiteboard

| Doc | What it is |
|---|---|
| [PLAYGROUND_HANDOFF.md](playground/PLAYGROUND_HANDOFF.md) | **Status.** Rules, code map, checks, what is finished, work queue |
| [PLAYGROUND_INSERT_TOOLS_PLAN.md](playground/PLAYGROUND_INSERT_TOOLS_PLAN.md) | Insert tools copied from WPS Office: Shapes, Symbol, Equation, Screenshot, Arrange (all built) |
| [PLAYGROUND_VISUAL_REDESIGN_PLAN.md](playground/PLAYGROUND_VISUAL_REDESIGN_PLAN.md) | The visual redesign (built 2026-10-17) |
| [PLAYGROUND_UX_FIX_PLAN.md](playground/PLAYGROUND_UX_FIX_PLAN.md) | Fixes from the UX audit (built 2026-10-16) |
| [PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md](playground/PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md) | Background analysis and the handwriting-accuracy plan (Phase D) |

## notes/: Notes Studio

| Doc | What it is |
|---|---|
| [NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md](notes/NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md) | **Status.** Writing mode, export and insert, tables, the assets library (built 2026-10-25) |
| [NOTES_VISUAL_REDESIGN_PLAN.md](notes/NOTES_VISUAL_REDESIGN_PLAN.md) | The Notes visual redesign (built 2026-10-18) |

## landing/: the home page

| Doc | What it is |
|---|---|
| [LANDING_REDESIGN_PLAN.md](landing/LANDING_REDESIGN_PLAN.md) | The landing redesign (built 2026-10-18; phone layout 2026-10-27) |

## handwriting/: recognition models

| Doc | What it is |
|---|---|
| [HTR_FROM_SCRATCH_PLAN.md](handwriting/HTR_FROM_SCRATCH_PLAN.md) | **Status.** Plan for a new, faster text model trained on public data |
| [handwriting_recognition_definitive_report.md](handwriting/handwriting_recognition_definitive_report.md) | Index of the two-part report below |
| [HANDWRITING_SYSTEM_EVOLUTION_PART1.md](handwriting/HANDWRITING_SYSTEM_EVOLUTION_PART1.md) | History, theory and the approaches that were tried |
| [HANDWRITING_SYSTEM_EVOLUTION_PART2.md](handwriting/HANDWRITING_SYSTEM_EVOLUTION_PART2.md) | Production design, fixes and benchmarks (as of 2026-09-30) |

## reports/ and research_notes/: market and SEO research

| Doc | What it is |
|---|---|
| [NETZ market and readiness analysis.md](<reports/NETZ market and readiness analysis.md>) | Market size, competitors, money, and how ready the product is |
| [NETZ global market and new methods.md](<reports/NETZ global market and new methods.md>) | Worldwide demand, payments abroad, which methods to add |
| [NETZ method search volume and SEO.md](<reports/NETZ method search volume and SEO.md>) | Search volume per method and the SEO playbook |
| [research_notes/](research_notes/) | The source notes behind each report, one folder per report, plus "NETZ topics and new units" |

## archive/: replaced or never built

Early specs and plans from August to October 2026. Later plans replaced them, or they describe designs that were dropped. Keep them for history and do not take tasks from them.

| Doc | Replaced by |
|---|---|
| [NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md](archive/NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md) | `launch/NETZ_ROADMAP.md` and `launch/NETZ_LAUNCH_PLAN.md` |
| [NETZ_V2_IMPLEMENTATION_PLAN.md](archive/NETZ_V2_IMPLEMENTATION_PLAN.md) | the same |
| [NETZ_IMPLEMENTATION_PLAN_PART1.md](archive/NETZ_IMPLEMENTATION_PLAN_PART1.md), [PART2](archive/NETZ_IMPLEMENTATION_PLAN_PART2.md) | the same |
| [PENDING_ROADMAP.md](archive/PENDING_ROADMAP.md), [MASTER_ROADMAP_AND_PENDING_TASKS.md](archive/MASTER_ROADMAP_AND_PENDING_TASKS.md) | `launch/NETZ_ROADMAP.md` |
| [NETZ_BACKEND_IMPLEMENTATION_PLAN.md](archive/NETZ_BACKEND_IMPLEMENTATION_PLAN.md), [SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md](archive/SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md) | `launch/NETZ_LAUNCH_PLAN.md` |
| [CODE_EXPORT_AND_WEBWORKER_IMPLEMENTATION_PLAN.md](archive/CODE_EXPORT_AND_WEBWORKER_IMPLEMENTATION_PLAN.md) | code export as built (`src/app/utils/codeExport/`), `methods/METHODS_IMPLEMENTATION_PLAN.md` |
| [PLAYGROUND_FEATURE_TECH_SPEC.md](archive/PLAYGROUND_FEATURE_TECH_SPEC.md), [PLAYGROUND_MODES_SPECIFICATION.md](archive/PLAYGROUND_MODES_SPECIFICATION.md), [PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md](archive/PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md) | `playground/PLAYGROUND_HANDOFF.md` |
| [NETZ_ONNX_HEURISTIC_ARCHITECTURE_IMPLEMENTATION_PLAN.md](archive/NETZ_ONNX_HEURISTIC_ARCHITECTURE_IMPLEMENTATION_PLAN.md), [OFFLINE_HANDWRITING_RECOGNITION_UPGRADE_PLAN.md](archive/OFFLINE_HANDWRITING_RECOGNITION_UPGRADE_PLAN.md) | `handwriting/` and `playground/PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md` |
| [NOTES_FEATURE_TECH_SPEC.md](archive/NOTES_FEATURE_TECH_SPEC.md) | `notes/` |
| [ALGORITHM_HUB_REDESIGN_PLAN.md](archive/ALGORITHM_HUB_REDESIGN_PLAN.md) | nothing: built, then reverted on 2026-10-22 at the owner's request |

## Where new docs go

- A new plan goes in the folder for its area. When it is finished, record that in the area's **status** doc.
- A new owner-only task goes in `launch/NETZ_OWNER_TODO.md`, never in a separate file.
- When a plan is replaced or dropped, move it to `archive/` and add a row to the table above.
