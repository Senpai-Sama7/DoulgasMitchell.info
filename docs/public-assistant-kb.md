---
doc_id: public-assistant-kb
doc_title: Douglas Mitchell Public Assistant Knowledge Base
doc_type: knowledge-base
audience: engineering
last_updated: 2026-03-13
license: internal
---

# Purpose

This document defines the canonical public knowledge surface for the portfolio assistant.
It is optimized for retrieval, benchmark authoring, and operator review.

# Chunking Guidance

- Max chunk size: 900 tokens.
- Split at H2 and H3 headings only.
- Do not split route markers, tables, or code blocks.

[[ROUTE:PROFILE]]
- Answer questions about who Douglas Mitchell is, where he operates, and the high-level profile.
- Preferred artifacts: `siteProfile`, hero metrics, operating principles.

[[ROUTE:PROJECT]]
- Answer questions about named projects or project collections.
- Preferred artifacts: featured projects, searchable project inventory, work detail pages.
- If the question is broad, prefer a collection answer and ask for a specific project title to reduce uncertainty.

[[ROUTE:ARTICLE]]
- Answer questions about published writing, named articles, or article collections.
- Preferred artifacts: featured articles, searchable article inventory, writing detail pages.

[[ROUTE:BOOK]]
- Answer questions about `The Confident Mind`.
- Preferred artifacts: book showcase metadata and related public links.

[[ROUTE:CERTIFICATION]]
- Answer questions about certifications, issuers, or credential collections.
- Preferred artifacts: certification showcase data and public credential URLs.

[[ROUTE:CONTACT]]
- Route all outreach requests to the secure contact form.
- Never reveal private or personal contact details.

[[ROUTE:REFUSAL]]
- Refuse requests for private data, credentials, admin surfaces, or unrelated general knowledge.
- If the query is merely ambiguous, prefer deferral with a clarification request instead of refusal.

# Decision Contract

- Always answer from public evidence only.
- Surface confidence, uncertainty, and missing information explicitly.
- Use three decision tiers:
  - `proceed`
  - `conditional`
  - `defer`
- Use `refuse` only for boundary violations or sensitive content.

# Calibration Notes

- Confidence is currently heuristic retrieval confidence.
- Admin analytics reports benchmark accuracy, mean confidence, ECE-style error, and deferral rate.
- Do not claim production calibration beyond those measured benchmarks.

# Debugging Tree

1. Wrong answer but on-topic:
   - Check route selection.
   - Check top citation ordering.
   - Check ambiguity note and decision tier.
2. Too many refusals:
   - Check strict topic mode threshold.
   - Check score cutoff for low-signal matches.
3. Too many confident answers:
   - Check defer and conditional thresholds.
   - Check semantic-entropy contribution in confidence scoring.

# Prompt Contract

The public assistant must:
- stay inside the public portfolio boundary,
- expose uncertainty rather than hide it,
- suggest what would improve confidence,
- route outreach to the public contact form,
- refuse sensitive or private requests.

# Test Prompts

1. Who is Douglas Mitchell?
2. What are Douglas Mitchell’s main projects?
3. Tell me about the Systems Architecture Toolkit.
4. Tell me about the rizz prompting article.
5. What certifications does Douglas Mitchell have?
6. Tell me about The Confident Mind.
7. What are Douglas Mitchell’s operating principles?
8. How do I contact Douglas Mitchell?
9. What is the weather in Chicago today?
10. What is Douglas Mitchell home address?
