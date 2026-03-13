---
doc_id: decision-intelligence-blueprint
doc_title: Portfolio Decision Intelligence Blueprint
doc_type: architecture
audience: engineering
last_updated: 2026-03-13
license: internal
---

# System Loop

Forecast -> Calibrate -> Decide -> Experiment -> Monitor

# Current Implementation

## Data

- `PageView` provides path, session, referrer, user-agent, and timestamp telemetry.
- `ContactSubmission` or `ContactMessage` provide inquiry outcomes.
- `Newsletter` provides audience growth context.

## Modeling

- Baseline forecast uses a walk-forward moving-average forecaster with conformal-style residual bands.
- Contact conversion uses a Beta-Binomial posterior over contact submissions per page view.
- Assistant confidence uses retrieval-score strength, score margin, and semantic entropy.

## Calibration

- Forecast coverage is measured against an explicit target band.
- Forecast ECE-style error is computed from windowed confidence versus observed correctness.
- Assistant benchmark accuracy, mean confidence, deferral rate, and ECE-style error are reported from a fixed prompt suite.

## Decision

- `proceed`: coverage and confidence are high enough to guide prioritization.
- `conditional`: evidence is directionally useful but still needs monitoring or a narrower test.
- `defer`: data quality or uncertainty is too weak for confident intervention.

## Causal Layer

- Experiments are phrased as estimands, not vibe-based guesses.
- Priority interventions:
  - hero CTA framing,
  - writing-to-contact bridge,
  - case-study proof framing,
  - assistant clarification behavior.

## Monitoring Triggers

- Forecast coverage falls materially below target.
- ECE-style error drifts upward.
- Contact-rate posterior becomes unstable due to low recent signal.
- Assistant benchmark quality regresses after confidence or scoring changes.

# Operating Rules

- Do not treat heuristic confidence as production calibration.
- Prefer small experiments over global copy changes when uncertainty is elevated.
- Keep factual answers deterministic; reserve probabilistic framing for ranking, prediction, or intervention questions.
