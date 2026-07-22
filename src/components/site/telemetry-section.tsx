'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { easings, gsap } from '@/lib/gsap';
import { heroMetrics, methodPatterns, operatingPrinciples } from '@/lib/site-content';

interface SignalNode {
  id: number;
  x: number;
  y: number;
  cluster: number;
}

interface SignalLink {
  id: string;
  from: SignalNode;
  to: SignalNode;
  crossCluster: boolean;
}

const SIGNAL_ANCHORS = [
  { x: 152, y: 142 },
  { x: 378, y: 286 },
  { x: 574, y: 126 },
] as const;

/**
 * One plotted point per public experiment in the stated 85+ archive. The
 * deterministic phyllotaxis layout keeps the field stable across renders.
 */
const SIGNAL_NODES: readonly SignalNode[] = Array.from({ length: 85 }, (_, id) => {
  const cluster = id % SIGNAL_ANCHORS.length;
  const orbit = Math.floor(id / SIGNAL_ANCHORS.length);
  const anchor = SIGNAL_ANCHORS[cluster];
  const angle = orbit * 2.399963 + cluster * 0.82;
  const radius = 13 + Math.sqrt(orbit) * 18;

  return {
    id,
    cluster,
    x: anchor.x + Math.cos(angle) * radius * 1.08,
    y: anchor.y + Math.sin(angle) * radius * 0.82,
  };
});

const SIGNAL_LINKS: readonly SignalLink[] = SIGNAL_NODES.flatMap((node, index) => {
  const links: SignalLink[] = [];
  const previousInCluster = SIGNAL_NODES[index - SIGNAL_ANCHORS.length];

  if (previousInCluster) {
    links.push({
      id: `${previousInCluster.id}-${node.id}`,
      from: previousInCluster,
      to: node,
      crossCluster: false,
    });
  }

  if (index > 12 && index % 11 === 0) {
    const crossClusterNode = SIGNAL_NODES[index - 10];
    if (crossClusterNode) {
      links.push({
        id: `cross-${crossClusterNode.id}-${node.id}`,
        from: crossClusterNode,
        to: node,
        crossCluster: true,
      });
    }
  }

  return links;
});

const LATENCY_DATA: { cycle: string; latency: number; reviewLoad: number }[] = [
  { cycle: 'B0', latency: 100, reviewLoad: 72 },
  { cycle: 'E1', latency: 89, reviewLoad: 68 },
  { cycle: 'E2', latency: 76, reviewLoad: 62 },
  { cycle: 'E3', latency: 64, reviewLoad: 57 },
  { cycle: 'E4', latency: 53, reviewLoad: 51 },
  { cycle: 'E5', latency: 45, reviewLoad: 47 },
  { cycle: 'E6', latency: 39, reviewLoad: 44 },
  { cycle: 'E7', latency: 35, reviewLoad: 42 },
];

const chartTick = {
  fill: 'var(--telemetry-muted)',
  fontFamily: 'var(--font-jetbrains-mono), var(--font-geist-mono), monospace',
  fontSize: 9,
  letterSpacing: '0.08em',
};

/**
 * Chapter 04 — Telemetry. A 1700px pinned doctrine beat on high-motion desktop
 * contexts; touch, low-tier, and reduced-motion contexts receive the same
 * signal field, model chart, principles, and receipt link as a static chapter.
 */
export function TelemetrySection() {
  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const opening = root.querySelector<HTMLElement>('.telemetry-opening');
      const signalField = root.querySelector<HTMLElement>('[data-telemetry-viz="signal"]');
      const latencyChart = root.querySelector<HTMLElement>('[data-telemetry-viz="latency"]');
      const principles = root.querySelector<HTMLElement>('[data-telemetry-viz="principles"]');
      const exit = root.querySelector<HTMLElement>('.telemetry-exit');
      const signalLinks = gsap.utils.toArray<SVGPathElement>('.telemetry-signal-link', root);
      const signalNodes = gsap.utils.toArray<SVGCircleElement>('.telemetry-signal-node', root);
      const metricHubs = gsap.utils.toArray<SVGGElement>('.telemetry-metric-hub', root);
      const chartCurves = gsap.utils.toArray<SVGPathElement>(
        '.telemetry-latency .recharts-line-curve',
        root
      );
      const chartArea = root.querySelector<SVGPathElement>(
        '.telemetry-latency .recharts-area-area'
      );
      const principleLine = root.querySelector<HTMLElement>('.telemetry-principle-line-fill');
      const principleItems = gsap.utils.toArray<HTMLElement>('.telemetry-principle', root);

      timeline.set([signalField, latencyChart, principles, exit], { autoAlpha: 0, y: 24 }, 0);
      timeline.set(signalLinks, { strokeDasharray: 1, strokeDashoffset: 1 }, 0);
      timeline.set(signalNodes, { scale: 0, transformOrigin: 'center center' }, 0);
      timeline.set(metricHubs, { autoAlpha: 0, y: 8 }, 0);
      timeline.set(principleLine, { scaleY: 0, transformOrigin: 'top center' }, 0);
      timeline.set(principleItems, { autoAlpha: 0, x: 18 }, 0);

      if (chartArea) {
        timeline.set(chartArea, { fillOpacity: 0 }, 0);
      }

      chartCurves.forEach((curve) => {
        const length = curve.getTotalLength();
        timeline.set(curve, { strokeDasharray: length, strokeDashoffset: length }, 0);
      });

      if (opening) {
        timeline.fromTo(
          opening,
          { y: 28, autoAlpha: 0, clipPath: 'inset(0 0 18% 0)' },
          {
            y: 0,
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.72,
            ease: easings.power4,
          },
          0
        );
      }

      if (signalField) {
        timeline.to(
          signalField,
          { autoAlpha: 1, y: 0, duration: 0.72, ease: easings.power4 },
          0.72
        );
      }
      timeline.to(
        signalLinks,
        { strokeDashoffset: 0, duration: 0.82, stagger: 0.006, ease: 'power1.inOut' },
        0.9
      );
      timeline.to(
        signalNodes,
        { scale: 1, duration: 0.42, stagger: 0.004, ease: 'back.out(1.8)' },
        1.02
      );
      timeline.to(
        metricHubs,
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.1, ease: easings.cubic },
        1.18
      );

      if (latencyChart) {
        timeline.to(
          latencyChart,
          { autoAlpha: 1, y: 0, duration: 0.7, ease: easings.power4 },
          1.82
        );
      }
      timeline.to(
        chartCurves,
        { strokeDashoffset: 0, duration: 0.9, stagger: 0.1, ease: 'power2.inOut' },
        2.02
      );
      if (chartArea) {
        timeline.to(chartArea, { fillOpacity: 1, duration: 0.6 }, 2.28);
      }

      if (principles) {
        timeline.to(principles, { autoAlpha: 1, y: 0, duration: 0.68, ease: easings.power4 }, 2.72);
      }
      if (principleLine) {
        timeline.to(principleLine, { scaleY: 1, duration: 1.08, ease: 'none' }, 2.88);
      }
      timeline.to(
        principleItems,
        { autoAlpha: 1, x: 0, duration: 0.46, stagger: 0.2, ease: easings.cubic },
        2.98
      );

      if (exit) {
        timeline.to(exit, { autoAlpha: 1, y: 0, duration: 0.64, ease: easings.power4 }, 4.02);
      }
    },
    {
      distance: 1700,
      scrub: 1,
      onStatic: (root) => {
        root.dataset.motion = 'static';
        gsap.set(
          root.querySelectorAll(
            '.telemetry-opening, [data-telemetry-viz], .telemetry-exit, .telemetry-signal-link, .telemetry-signal-node, .telemetry-metric-hub, .telemetry-latency .recharts-line-curve, .telemetry-latency .recharts-area-area, .telemetry-principle, .telemetry-principle-line-fill'
          ),
          { clearProps: 'all' }
        );
      },
    }
  );

  return (
    <section id="telemetry" className="telemetry-section" aria-labelledby="telemetry-title">
      <div ref={stageRef} className="telemetry-stage">
        <div className="telemetry-grid" aria-hidden />

        <div className="telemetry-shell">
          <header className="telemetry-opening">
            <p className="telemetry-chapter">Chapter 04 · Telemetry</p>
            <div className="telemetry-opening-layout">
              <div>
                <p className="telemetry-kicker">Doctrine / instrumented practice</p>
                <h2 id="telemetry-title">Proof under instrumentation.</h2>
              </div>
              <p className="telemetry-deck">
                An operating claim is only useful when the signal, latency, and human checkpoint can
                be inspected together.
              </p>
            </div>
          </header>

          <div className="telemetry-collage">
            <figure className="telemetry-viz telemetry-signal-field" data-telemetry-viz="signal">
              <header className="telemetry-viz-head">
                <div>
                  <span>FIG 04–A</span>
                  <h3>Signal field</h3>
                </div>
                <p>85 plotted nodes / public archive</p>
              </header>

              <div className="telemetry-signal-canvas">
                <svg
                  viewBox="0 0 720 420"
                  role="img"
                  aria-label="A network of 85 plotted nodes representing public experiments, organized around public experiments, operating disciplines, and verified credentials."
                >
                  <g className="telemetry-field-coordinates" aria-hidden>
                    {[90, 180, 270, 360].map((y) => (
                      <line key={`h-${y}`} x1="0" x2="720" y1={y} y2={y} />
                    ))}
                    {[120, 240, 360, 480, 600].map((x) => (
                      <line key={`v-${x}`} x1={x} x2={x} y1="0" y2="420" />
                    ))}
                  </g>

                  <g aria-hidden>
                    {SIGNAL_LINKS.map((link) => (
                      <path
                        key={link.id}
                        className="telemetry-signal-link"
                        data-cross-cluster={link.crossCluster || undefined}
                        pathLength={1}
                        d={`M ${link.from.x.toFixed(2)} ${link.from.y.toFixed(2)} L ${link.to.x.toFixed(2)} ${link.to.y.toFixed(2)}`}
                      />
                    ))}
                  </g>

                  <g aria-hidden>
                    {SIGNAL_NODES.map((node) => (
                      <circle
                        key={node.id}
                        className="telemetry-signal-node"
                        data-cluster={node.cluster}
                        data-major={node.id % 13 === 0 || undefined}
                        cx={node.x}
                        cy={node.y}
                        r={node.id % 13 === 0 ? 3.25 : 1.85}
                      />
                    ))}
                  </g>

                  {heroMetrics.map((metric, index) => {
                    const anchor = SIGNAL_ANCHORS[index];
                    if (!anchor) return null;

                    return (
                      <g
                        key={metric.label}
                        className="telemetry-metric-hub"
                        transform={`translate(${anchor.x} ${anchor.y})`}
                      >
                        <rect x="-7" y="-7" width="14" height="14" />
                        <line x1="9" x2="29" y1="0" y2="0" />
                        <text className="telemetry-hub-value" x="34" y="-3">
                          {metric.value}
                        </text>
                        <text className="telemetry-hub-label" x="34" y="11">
                          {metric.label}
                        </text>
                      </g>
                    );
                  })}

                  <text className="telemetry-field-plus" x="680" y="398">
                    + CONTINUING
                  </text>
                </svg>
              </div>

              <figcaption>
                <span>Archive topology</span>
                Each point is a plotted experiment marker; proximity describes working-discipline
                clusters, not performance.
              </figcaption>

              <ol className="telemetry-pattern-index" aria-label="Instrumented method patterns">
                {methodPatterns.map((pattern, index) => (
                  <li key={pattern.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {pattern.title}
                  </li>
                ))}
              </ol>
            </figure>

            <figure className="telemetry-viz telemetry-latency" data-telemetry-viz="latency">
              <header className="telemetry-viz-head">
                <div>
                  <span>FIG 04–B</span>
                  <h3>Decision latency compression</h3>
                </div>
                <p>Relative index / B0 = 100</p>
              </header>

              <div className="telemetry-chart-key" aria-hidden>
                <span data-series="latency">Decision latency</span>
                <span data-series="review">Human review load</span>
              </div>

              <div className="telemetry-latency-plot">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{ width: 560, height: 240 }}
                >
                  <ComposedChart
                    data={LATENCY_DATA}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="telemetry-latency-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--telemetry-signal)" stopOpacity={0.3} />
                        <stop
                          offset="100%"
                          stopColor="var(--telemetry-signal)"
                          stopOpacity={0.015}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--telemetry-line)"
                      strokeDasharray="1 5"
                    />
                    <XAxis
                      dataKey="cycle"
                      tick={chartTick}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--telemetry-line)' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={chartTick}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Area
                      className="telemetry-latency-area"
                      type="monotone"
                      dataKey="latency"
                      stroke="none"
                      fill="url(#telemetry-latency-fill)"
                      isAnimationActive={false}
                    />
                    <Line
                      className="telemetry-latency-line"
                      type="monotone"
                      dataKey="latency"
                      stroke="var(--telemetry-signal)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      className="telemetry-review-line"
                      type="monotone"
                      dataKey="reviewLoad"
                      stroke="var(--telemetry-text)"
                      strokeWidth={1.15}
                      strokeDasharray="4 5"
                      strokeOpacity={0.62}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <figcaption>
                Illustrative model — x: evaluation cycle; y: relative index. This is a coherent
                operating scenario, not observed production telemetry.
              </figcaption>
            </figure>

            <aside
              className="telemetry-viz telemetry-principles"
              data-telemetry-viz="principles"
              aria-labelledby="telemetry-principles-title"
            >
              <header className="telemetry-viz-head">
                <div>
                  <span>FIG 04–C</span>
                  <h3 id="telemetry-principles-title">Doctrine spine</h3>
                </div>
                <p>Three controls / one system</p>
              </header>

              <div className="telemetry-principle-track">
                <span className="telemetry-principle-line" aria-hidden>
                  <span className="telemetry-principle-line-fill" />
                </span>
                <ol>
                  {operatingPrinciples.map((principle, index) => (
                    <li key={principle.title} className="telemetry-principle">
                      <span className="telemetry-principle-node" aria-hidden />
                      <p>PR–{String(index + 1).padStart(2, '0')}</p>
                      <h4>{principle.title}</h4>
                      <span>{principle.description}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>

          <footer className="telemetry-exit">
            <p>Claims are provisional. Receipts are inspectable.</p>
            <Magnetic strength={0.26} radius={110}>
              <a href="#work" data-cursor="interactive">
                Inspect the receipts <span aria-hidden>→</span>
              </a>
            </Magnetic>
          </footer>
        </div>
      </div>
    </section>
  );
}
