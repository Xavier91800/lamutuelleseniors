<!-- SPECKIT START -->
Active feature: **001-lead-funnel-seniors** (branch `001-lead-funnel-seniors`).

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/001-lead-funnel-seniors/plan.md`. The supporting artefacts live next
to it: `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and
`contracts/`.
<!-- SPECKIT END -->

## Infrastructure

This project is deployed behind a shared Nginx Proxy Manager on the same host
as several other Next.js sites. Before any deployment work, **read `INFRA.md`**
at the repo root — it documents the NPM setup, the per-project compose
convention, the deployment procedure, and a known 502 pitfall.
