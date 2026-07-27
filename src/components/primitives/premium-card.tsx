"use client";

/**
 * PremiumCard — Showcases 2025 CSS features in a reusable component:
 * - container queries (cqi units) for fluid typography
 * - :has() parent-aware hover state
 * - scroll-driven animation via view-timeline
 * - color-mix() dynamic hover colors
 * - light-dark() automatic dark mode
 * - text-wrap: balance for headlines
 * - glassmorphism with prefers-reduced-transparency fallback
 *
 * Zero JS animation. All effects run on compositor thread.
 */
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: "default" | "glass" | "elevated" | "outline";
  /** Enable scroll-driven entrance animation */
  animated?: boolean;
  /** Optional href to render as link */
  href?: string;
}

export function PremiumCard({
  children,
  className,
  title,
  subtitle,
  variant = "default",
  animated = true,
  href,
}: PremiumCardProps) {
  const baseClasses = cn(
    "group relative block rounded-2xl p-6 md:p-8",
    "transition-[transform,box-shadow] duration-500 ease-out",
    "ease-spring will-change-transform",
    variant === "default" && "surface-elevated-1 border border-subtle",
    variant === "glass" && "glass",
    variant === "elevated" && "surface-elevated-2 shadow-lg",
    variant === "outline" && "border-2 border-subtle bg-transparent",
    animated && "scroll-slide-up",
    "card-interactive",
    className,
  );

  const Content = (
    <>
      {title && (
        <h3 className="balance kinetic-headline text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="pretty text-muted mt-2 text-sm md:text-base">
          {subtitle}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn(baseClasses, "no-underline")}>
        {Content}
      </a>
    );
  }

  return <article className={baseClasses}>{Content}</article>;
}

/**
 * BentoGrid — Apple-level asymmetric layout using CSS subgrid (2025).
 * Children inherit the parent grid tracks for perfect alignment.
 */
export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("bento-grid", className)}>{children}</div>;
}

/**
 * KineticHeading — Variable font with scroll-driven weight animation.
 * Uses font-variation-settings for buttery-smooth weight transitions.
 */
export function KineticHeading({
  children,
  as: Tag = "h2",
  className,
  size = "lg",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl",
    xl: "text-5xl md:text-6xl",
    "2xl": "text-6xl md:text-7xl",
  }[size];

  return (
    <Tag
      className={cn(
        "balance kinetic-scroll display-text font-medium tracking-tight",
        sizeClasses,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * ProgressBar — CSS scroll-driven progress indicator.
 * No JS, no IntersectionObserver, no state updates.
 */
export function ScrollProgressBar() {
  return (
    <div
      className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left"
      aria-hidden="true"
    >
      <div className="scroll-progress-bar h-full bg-[var(--color-brand-accent,oklch(70%_0.12_195))]" />
    </div>
  );
}

/**
 * FluidContainer — Container query container for intrinsic scaling.
 * Children using cqi/cqw units will scale with container, not viewport.
 */
export function FluidContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container-fluid", className)}>{children}</div>
  );
}
