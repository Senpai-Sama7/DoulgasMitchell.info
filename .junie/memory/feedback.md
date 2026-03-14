[2026-03-11 06:06] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "model usage explanation",
    "EXPECTATION": "User wanted a clear, accurate separation between the assistant's own token usage and tokens spent by external tools like opencode/codex.",
    "NEW INSTRUCTION": "WHEN explaining session/model usage THEN distinguish assistant tokens from tool-invoked model tokens explicitly."
}

[2026-03-11 06:15] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "UI positioning and fade behavior",
    "EXPECTATION": "The 'Douglas Mitchell' title should be positioned higher, remain visible longer during scroll (slower fade-out), the entrance overlay should not obscure bottom elements, and the 'DM' mark should be precisely centered/aligned.",
    "NEW INSTRUCTION": "WHEN modifying hero/overlay visuals THEN position title higher, slow scroll fade, preserve bottom content, center 'DM'."
}

[2026-03-11 07:15] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "model usage explanation",
    "EXPECTATION": "User wanted a clear, accurate separation between the assistant's own token usage and tokens spent by external tools like opencode/codex.",
    "NEW INSTRUCTION": "WHEN explaining session/model usage THEN distinguish assistant tokens from tool-invoked model tokens explicitly."
}

[2026-03-11 07:24] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Mobile overflow & admin portal visibility",
    "EXPECTATION": "User expects no horizontal scrolling on mobile (overflow-x fully prevented) and an admin portal that is hidden in plain sight yet still protected/auth-gated.",
    "NEW INSTRUCTION": "WHEN mobile layout shows any horizontal scroll THEN remove overflow-x and fix offending widths/margins at root and components.\nWHEN adding/administering admin portal THEN hide entry behind inconspicuous route/trigger while enforcing full auth protection."
}

[2026-03-11 07:24] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Mobile overflow & admin portal visibility",
    "EXPECTATION": "User wants zero horizontal scrolling on mobile and a hidden-in-plain-sight admin portal that remains fully auth-protected.",
    "NEW INSTRUCTION": "WHEN any mobile page allows horizontal scroll THEN eliminate overflow-x by fixing root and offending component widths/margins and enforce overflow-x-hidden globally.\nWHEN implementing/administering the admin portal THEN expose an inconspicuous entry (hidden route or subtle trigger) while enforcing full authentication/authorization."
}

[2026-03-11 09:37] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Hero title & mobile UX",
    "EXPECTATION": "After the entrance overlay, 'Douglas Mitchell' should type in ASCII once (no loop), mobile must not allow horizontal scroll at default zoom (only when user zooms in), and the 'Replay intro' button should not be visible on the main page.",
    "NEW INSTRUCTION": "WHEN showing hero after overlay THEN play one-time ASCII typing for 'Douglas Mitchell'.\nWHEN testing mobile at default zoom THEN eliminate all horizontal scrolling.\nWHEN rendering post-intro UI THEN hide or remove the 'Replay intro' button."
}

[2026-03-11 09:38] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Hero typing, mobile scroll, replay button",
    "EXPECTATION": "After the entrance overlay, 'Douglas Mitchell' should type in ASCII once (no loop), mobile must not allow horizontal scroll at default zoom, and the 'Replay intro' button should not appear on the main page.",
    "NEW INSTRUCTION": "WHEN showing hero after overlay THEN play one-time ASCII typing for 'Douglas Mitchell'."
}

[2026-03-11 09:42] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Token attribution clarity",
    "EXPECTATION": "User wants a precise separation between the assistant's own token usage and tokens consumed by external tools like opencode/codex, and to not conflate them.",
    "NEW INSTRUCTION": "WHEN asked about my token usage THEN exclude tool-invoked tokens and state separation explicitly."
}

[2026-03-11 09:45] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Token attribution clarity",
    "EXPECTATION": "User wants the assistant's token usage reported separately from any tokens consumed by external tools like opencode/codex, with no conflation.",
    "NEW INSTRUCTION": "WHEN asked about my token or session usage THEN report only my tokens and list tool-invoked tokens separately."
}

[2026-03-11 09:51] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Contact email display",
    "EXPECTATION": "The user's email should be listed exactly as DouglasMitchell@ReliantAI.org wherever contact info appears.",
    "NEW INSTRUCTION": "WHEN contact email is displayed or used THEN use DouglasMitchell@ReliantAI.org exactly."
}

[2026-03-13 16:14] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "Broken links & site-wide QA",
    "EXPECTATION": "The 'AI Workflow Automation' work page and the '#work' anchor should resolve correctly, and every page across the site must be verified as real, working, and fully functional.",
    "NEW INSTRUCTION": "WHEN reporting site health or UI audit THEN live-check all routes and anchors and list any 4xx/5xx or missing targets with proof.\nWHEN any provided URL 404s or anchor is absent THEN fix the route or link and show passing curl/HTTP proof after deployment."
}

[2026-03-13 16:17] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Broken links & site-wide QA",
    "EXPECTATION": "User expects the cited links to resolve correctly and a full site-wide verification that every page and anchor is real, working, and fully functional with live proof.",
    "NEW INSTRUCTION": "WHEN auditing site links THEN live-check all routes and anchors and include curl/HTTP proofs."
}

[2026-03-13 18:02] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Scroll fade timing",
    "EXPECTATION": "The referenced section should remain readable longer; the fade-out on scroll is too fast.",
    "NEW INSTRUCTION": "WHEN adding scroll-driven fades to hero/sections THEN increase fade-out to ≥70% scroll with ease-out."
}

[2026-03-13 18:04] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Scroll fade timing",
    "EXPECTATION": "The referenced section should remain readable longer; its scroll-driven fade occurs too early and too quickly.",
    "NEW INSTRUCTION": "WHEN a section’s content fades on scroll THEN delay fade until ≥90% scroll and use ease-out."
}

[2026-03-13 18:09] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Scroll fade timing",
    "EXPECTATION": "The referenced section fades out too quickly on scroll; it should remain readable significantly longer before starting to fade.",
    "NEW INSTRUCTION": "WHEN a section uses scroll-driven fade THEN keep opacity 1 until ≥85% scroll, then ease-out to 0 by 100%."
}

[2026-03-13 22:43] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Admin table responsiveness",
    "EXPECTATION": "The right side of the admin portal's operator table should be responsive/adaptive and not appear squished on smaller or constrained viewports.",
    "NEW INSTRUCTION": "WHEN admin operator table on narrow viewports THEN enable horizontal scroll and prevent column squish."
}

[2026-03-13 22:47] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Admin table responsiveness",
    "EXPECTATION": "The admin portal's operator table should remain readable on narrow/constrained viewports without columns being squished, using horizontal scroll if necessary.",
    "NEW INSTRUCTION": "WHEN admin operator table on narrow viewports THEN enable horizontal scroll and prevent column squish."
}

[2026-03-14 00:24] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Hero visualizer placement",
    "EXPECTATION": "The visualizer should sit above the Proof of Work, Operating Focus, and Credential Signals, with a sleek, minimalist, luxurious look that fills the space.",
    "NEW INSTRUCTION": "WHEN arranging hero metrics and visualizer THEN place visualizer directly above those three metrics.\nWHEN styling the visualizer THEN use minimalist elegant design that fills available space."
}

