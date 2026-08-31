---
name: board-report
description: A versioned revenue report with frozen period data and explicit provenance.
---

# Board report

Create a board report only for a defined reporting period and audience.

Write the instance under `outputs/board-reports/<period>/`. Freeze the metrics
used for the report, record the extraction timestamp, and keep a small
provenance file beside the rendered output. Reconcile totals before
designation.

The report should cover pipeline movement, wins and losses, forecast changes,
retention risks, and actions requiring leadership attention. Keep customer
details at the minimum level approved for the audience.

Produce Markdown for this release's `board-report` Type. If the product later
needs an interactive presentation, add a separately versioned Type whose
runner serves HTML over Dharta's assigned loopback port. Use `type_id`
`board-report` when designating this Artifact.
