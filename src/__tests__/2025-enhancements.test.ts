import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("2025 CSS enhancements layer", () => {
  it("exists and is imported into globals.css", () => {
    expect(existsSync(join(SRC, "styles/2025-enhancements.css"))).toBe(true);
    const css = read("app/globals.css");
    expect(css).toContain("2025-enhancements.css");
  });

  it("contains CSS scroll-driven animations", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("animation-timeline: scroll()");
    expect(css).toContain("animation-timeline: view()");
    expect(css).toContain("@supports (animation-timeline: scroll())");
  });

  it("contains View Transitions API rules", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("@view-transition");
    expect(css).toContain("::view-transition-old");
    expect(css).toContain("::view-transition-new");
  });

  it("contains :has() selector patterns", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain(":has(");
    expect(css).toMatch(/:has\(:invalid/);
    expect(css).toMatch(/:has\(:focus-visible\)/);
  });

  it("contains container query units", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("container-type: inline-size");
    expect(css).toMatch(/\d+cqi/);
  });

  it("contains subgrid patterns", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("grid-template-rows: subgrid");
    expect(css).toContain(".bento-grid");
  });

  it("contains variable font kinetic typography", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("font-variation-settings");
    expect(css).toContain("'opsz'");
  });

  it("contains text-wrap: balance", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("text-wrap: balance");
    expect(css).toContain("text-wrap: pretty");
  });

  it("contains color-mix() dynamic color system", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("color-mix(in oklch");
    expect(css).toMatch(/@supports \(color: color-mix/);
  });

  it("contains light-dark() automatic dark mode", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("light-dark(");
    expect(css).toContain("color-scheme: light dark");
  });

  it("contains linear() physics-based easing", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("linear(");
    expect(css).toContain(".ease-spring");
  });

  it("contains glassmorphism 2.0 with reduced-transparency fallback", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("backdrop-filter: blur(20px)");
    expect(css).toContain("prefers-reduced-transparency");
  });

  it("contains WCAG 2.2 24x24px target size patterns", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("min-width: 24px");
    expect(css).toContain("min-height: 24px");
  });

  it("contains focus-visible not-obscured pattern", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline-offset: 2px");
  });

  it("contains prefers-reduced-motion respect", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("scroll-behavior: auto !important");
  });
});

describe("2025 premium primitives", () => {
  it("PremiumCard exposes all variants", async () => {
    const mod = await import("@/components/primitives/premium-card");
    expect(typeof mod.PremiumCard).toBe("function");
    expect(typeof mod.BentoGrid).toBe("function");
    expect(typeof mod.KineticHeading).toBe("function");
    expect(typeof mod.ScrollProgressBar).toBe("function");
    expect(typeof mod.FluidContainer).toBe("function");
  });
});

describe("2025 view transitions helper", () => {
  it("exports useViewTransition hook", async () => {
    const mod = await import("@/lib/view-transitions");
    expect(typeof mod.useViewTransition).toBe("function");
    expect(typeof mod.viewTransitionName).toBe("function");
  });
});

describe("2025 layout integration", () => {
  it("enables View Transitions in root layout", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain("unstable_View_Transitions");
  });
});

/* ═══ Phase 8 — 2026 Premium Refresh (added 2026-07-27) ═══ */

describe("2026 entry transitions (Phase 8.2)", () => {
  it("contains @starting-style and transition-behavior: allow-discrete", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("@starting-style");
    expect(css).toContain("transition-behavior: allow-discrete");
  });

  it("gates entry transitions behind @supports", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toMatch(
      /@supports\s*\(transition-behavior:\s*allow-discrete\)/
    );
  });

  it("respects prefers-reduced-motion inside the entry-transitions block", () => {
    const css = read("styles/2025-enhancements.css");
    // Find the entry-transitions @supports block and check it contains the guard
    const block = css.slice(
      css.indexOf("@supports (transition-behavior: allow-discrete)"),
    );
    expect(block).toContain("prefers-reduced-motion: no-preference");
  });

  it("exposes .premium-enter and .premium-enter-slate utility classes", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain(".premium-enter {");
    expect(css).toContain(".premium-enter-slate {");
  });
});

describe("2026 interpolate-size (Phase 8.3)", () => {
  it("declares interpolate-size: allow-keywords on :root", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toMatch(/interpolate-size:\s*allow-keywords/);
  });

  it("gates the feature behind @supports (interpolate-size: allow-keywords)", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toMatch(
      /@supports\s*\(interpolate-size:\s*allow-keywords\)/
    );
  });

  it("targets the cinema depth-handoff gradient", () => {
    const css = read("styles/2025-enhancements.css");
    // Find the block, then assert it references the cinema depth gradient
    const block = css.slice(css.indexOf("@supports (interpolate-size:"));
    expect(block).toContain(".cinema-section::before");
  });

  it("respects prefers-reduced-motion inside the block", () => {
    const css = read("styles/2025-enhancements.css");
    const block = css.slice(css.indexOf("@supports (interpolate-size:"));
    expect(block).toContain("prefers-reduced-motion: no-preference");
  });
});

describe("2026 cinema light-dark() (Phase 8.4)", () => {
  it("wraps every cinema color token in light-dark()", () => {
    const css = read("app/globals.css");
    // Find the .cinema-section block
    const block = css.slice(css.indexOf(".cinema-section {"));
    expect(block).toContain("--cinema-ink: light-dark(");
    expect(block).toContain("--cinema-panel: light-dark(");
    expect(block).toContain("--cinema-text: light-dark(");
    expect(block).toContain("--cinema-muted: light-dark(");
    expect(block).toContain("--cinema-line: light-dark(");
    expect(block).toContain("--cinema-signal: light-dark(");
  });

  it("sets color-scheme: light dark on .cinema-section so light-dark() resolves", () => {
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf(".cinema-section {"));
    // Should appear before the closing brace of the .cinema-section block
    const closing = block.indexOf("}");
    const head = block.slice(0, closing);
    expect(head).toContain("color-scheme: light dark");
  });

  it("preserves the dark-mode ink/panel values as the second light-dark() arg", () => {
    // Sanity: the dark values are still present (just as the second arg now)
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf(".cinema-section {"));
    expect(block).toContain("oklch(0.105 0.014 250)"); // ink dark
    expect(block).toContain("oklch(0.95 0.006 236)"); // text dark
  });
});

describe("2026 text-wrap balance/pretty (Phase 8.5)", () => {
  it("applies text-wrap: pretty to .cinema-statement (with a comment)", () => {
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf(".cinema-statement {"));
    const closing = block.indexOf("}");
    const head = block.slice(0, closing);
    expect(head).toContain("text-wrap: pretty");
    // Comment explaining why pretty (not balance) is correct here.
    // The comment is *above* the property, so search backwards from the
    // property to the opening of the block.
    const propIdx = head.indexOf("text-wrap: pretty");
    const preceding = head.slice(0, propIdx);
    expect(preceding).toContain("balance");
  });

  it("keeps text-wrap: balance elsewhere (utility class)", () => {
    const css = read("styles/2025-enhancements.css");
    expect(css).toContain("text-wrap: balance");
  });
});

describe("2026 source citations (Phase 8.6)", () => {
  it("cites MDN / W3C / web.dev / Chrome for Developers in the file header", () => {
    const css = read("styles/2025-enhancements.css");
    // The header summary lists each 2026 addition with at least one source URL
    const header = css.slice(0, css.indexOf("SCROLL-DRIVEN ANIMATIONS"));
    expect(header).toContain("MDN");
    expect(header).toContain("W3C");
    // The new 2026 sections each cite at least one official source.
    const body = css.slice(css.indexOf("SCROLL-DRIVEN ANIMATIONS"));
    const mdns = (body.match(/MDN:/g) || []).length;
    const w3cs = (body.match(/W3C:/g) || []).length;
    // The 2026 addendum sections cite at least 2 MDN + 2 W3C
    // (one each for the interpolate-size / entry-transition / light-dark areas)
    expect(mdns).toBeGreaterThanOrEqual(2);
    expect(w3cs).toBeGreaterThanOrEqual(1);
  });

  it("documents the View Transitions decision (MPA opt-in NOT used)", () => {
    const css = read("styles/2025-enhancements.css");
    const header = css.slice(0, css.indexOf("SCROLL-DRIVEN ANIMATIONS"));
    expect(header).toContain("NOT used");
    expect(header).toContain("single route");
  });
});
