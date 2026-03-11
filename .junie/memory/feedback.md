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

