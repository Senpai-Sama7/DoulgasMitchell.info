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
