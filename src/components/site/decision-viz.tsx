'use client';

import { useEffect } from 'react';
import { motion, useSpring, type MotionValue } from 'framer-motion';
import {
  Area,
  ComposedChart,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { ForecastPoint } from '@/lib/decision-intelligence';

/* ── Radial calibration gauge ────────────────────────────────────────────────
   A 240° precision dial: fine tick ring, threshold markers at the defer and
   conditional floors, a tone-driven value arc, and a sprung needle. All motion
   is transform / pathLength only, and every color routes through --sim-tone so
   the dial re-keys with the recommendation state. */

const GAUGE_CX = 130;
const GAUGE_CY = 130;
const GAUGE_SWEEP = 240;
const GAUGE_START = 210;

function polar(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: GAUGE_CX + radius * Math.cos(rad), y: GAUGE_CY - radius * Math.sin(rad) };
}

function fractionToAngle(fraction: number) {
  return GAUGE_START - GAUGE_SWEEP * fraction;
}

function arcPath(radius: number, fromFraction: number, toFraction: number) {
  const from = polar(radius, fractionToAngle(fromFraction));
  const to = polar(radius, fractionToAngle(toFraction));
  const largeArc = (toFraction - fromFraction) * GAUGE_SWEEP > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

function tickLine(fraction: number, innerRadius: number, outerRadius: number) {
  const angle = fractionToAngle(fraction);
  const from = polar(innerRadius, angle);
  const to = polar(outerRadius, angle);
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
}

interface CalibrationGaugeProps {
  /** Confidence in [0, 1]. */
  value: number;
  /** Short readout under the numeral, e.g. "moderate signal". */
  label: string;
  deferThreshold: number;
  conditionalThreshold: number;
  reduceMotion: boolean;
}

function useTrackedSpring(target: number, reduceMotion: boolean): MotionValue<number> {
  const spring = useSpring(0, { stiffness: 68, damping: 17, mass: 0.9 });

  useEffect(() => {
    if (reduceMotion) {
      spring.jump(target);
    } else {
      spring.set(target);
    }
  }, [target, reduceMotion, spring]);

  return spring;
}

export function CalibrationGauge({
  value,
  label,
  deferThreshold,
  conditionalThreshold,
  reduceMotion,
}: CalibrationGaugeProps) {
  const progress = useTrackedSpring(value, reduceMotion);
  const minorTicks = Array.from({ length: 41 }, (_, index) => index / 40);
  const majorTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="sim-gauge" role="img" aria-label={`Calibrated confidence ${Math.round(value * 100)} percent — ${label}`}>
      <svg viewBox="0 0 260 208" className="h-auto w-full">
        {/* Tick ring */}
        {minorTicks.map((fraction) => {
          const major = majorTicks.includes(fraction);
          const line = tickLine(fraction, major ? 99 : 101, major ? 108 : 106);
          return (
            <line
              key={fraction}
              {...line}
              className={major ? 'sim-gauge-tick-major' : 'sim-gauge-tick'}
            />
          );
        })}

        {/* Scale labels — endpoints and midpoint only; thresholds carry the rest */}
        {[0, 0.5, 1].map((fraction) => {
          const position = polar(119, fractionToAngle(fraction));
          return (
            <text
              key={fraction}
              x={position.x}
              y={position.y + 3}
              textAnchor="middle"
              className="sim-gauge-scale"
            >
              {Math.round(fraction * 100)}
            </text>
          );
        })}

        {/* Track + zone band */}
        <path d={arcPath(94, 0, 1)} className="sim-gauge-track" />
        <path d={arcPath(84, 0, deferThreshold)} className="sim-gauge-zone" data-zone="defer" />
        <path
          d={arcPath(84, deferThreshold, conditionalThreshold)}
          className="sim-gauge-zone"
          data-zone="conditional"
        />
        <path d={arcPath(84, conditionalThreshold, 1)} className="sim-gauge-zone" data-zone="proceed" />

        {/* Threshold markers — the policy floors, not decoration */}
        {[deferThreshold, conditionalThreshold].map((threshold) => {
          const line = tickLine(threshold, 78, 110);
          const labelPosition = polar(119, fractionToAngle(threshold));
          return (
            <g key={threshold}>
              <line {...line} className="sim-gauge-threshold" />
              <text
                x={labelPosition.x}
                y={labelPosition.y + 3}
                textAnchor="middle"
                className="sim-gauge-threshold-label"
              >
                {Math.round(threshold * 100)}
              </text>
            </g>
          );
        })}

        {/* Value arc — sprung draw-on via pathLength */}
        <motion.path
          d={arcPath(94, 0, 1)}
          className="sim-gauge-value"
          style={{ pathLength: progress }}
        />

        {/* Needle */}
        <motion.g
          style={{
            rotate: reduceMotion ? -120 + GAUGE_SWEEP * value : undefined,
            transformBox: 'view-box',
            transformOrigin: `${GAUGE_CX}px ${GAUGE_CY}px`,
          }}
          animate={reduceMotion ? undefined : { rotate: -120 + GAUGE_SWEEP * value }}
          transition={
            reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 68, damping: 15 }
          }
        >
          <path
            d={`M ${GAUGE_CX - 2.6} ${GAUGE_CY + 14} L ${GAUGE_CX} ${GAUGE_CY - 76} L ${GAUGE_CX + 2.6} ${GAUGE_CY + 14} Z`}
            className="sim-gauge-needle"
          />
        </motion.g>
        <circle cx={GAUGE_CX} cy={GAUGE_CY} r={6} className="sim-gauge-hub" />
        <circle cx={GAUGE_CX} cy={GAUGE_CY} r={2.2} className="sim-gauge-hub-dot" />

        {/* Numeral readout — exact, remounted with a soft morph on change */}
        <motion.text
          key={Math.round(value * 100)}
          x={GAUGE_CX}
          y={182}
          textAnchor="middle"
          className="sim-gauge-numeral"
          initial={reduceMotion ? false : { opacity: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {Math.round(value * 100)}
          <tspan className="sim-gauge-unit" dx={2}>
            %
          </tspan>
        </motion.text>
        <text x={GAUGE_CX} y={200} textAnchor="middle" className="sim-gauge-caption">
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ── Uncertainty decomposition radar ─────────────────────────────────────────
   Five risk axes plotted against a dashed "deploy envelope" reference polygon.
   A reading inside the envelope is shippable; spikes name the failing lever. */

export interface UncertaintyAxis {
  axis: string;
  value: number;
  envelope: number;
}

function RadarAxisTick({
  x,
  y,
  textAnchor,
  payload,
}: {
  x?: number;
  y?: number;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
  payload?: { value?: string };
}) {
  return (
    <text x={x} y={y} dy={4} textAnchor={textAnchor} className="sim-radar-tick">
      {payload?.value}
    </text>
  );
}

export function UncertaintyRadar({
  axes,
  animate,
}: {
  axes: UncertaintyAxis[];
  animate: boolean;
}) {
  return (
    <div className="sim-radar h-56 w-full md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={axes} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="var(--border)" strokeOpacity={0.6} gridType="polygon" />
          <PolarAngleAxis dataKey="axis" tick={<RadarAxisTick />} />
          <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
          <Radar
            name="Deploy envelope"
            dataKey="envelope"
            stroke="color-mix(in oklch, var(--foreground), transparent 45%)"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="none"
            isAnimationActive={false}
          />
          <Radar
            name="Live reading"
            dataKey="value"
            stroke="var(--brand-accent)"
            strokeWidth={1.5}
            fill="var(--brand-accent)"
            fillOpacity={0.13}
            isAnimationActive={animate}
            animationDuration={620}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Forecast strip ──────────────────────────────────────────────────────────
   Observed decision throughput (solid ink) hands off at NOW to a dashed teal
   projection wrapped in its walk-forward calibration band. */

export interface ForecastStripPoint extends ForecastPoint {
  label: string;
}

export function ForecastStrip({
  points,
  animate,
}: {
  points: ForecastStripPoint[];
  animate: boolean;
}) {
  const data = points.map((point) => ({
    label: point.label,
    observed: point.projected ? null : point.actual,
    projected: point.projected ? point.prediction : null,
    bandBase: point.projected ? point.lowerBound : null,
    bandSize: point.projected ? point.upperBound - point.lowerBound : null,
  }));

  return (
    <div className="sim-forecast h-36 w-full md:h-40">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="sim-forecast-band" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.26} />
              <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            ticks={['T-20', 'T-15', 'T-10', 'T-5', 'NOW', '+7']}
            tick={{
              fontSize: 9,
              letterSpacing: '0.12em',
              fill: 'var(--muted-foreground)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.7 }}
            interval={0}
          />
          <YAxis hide domain={[0, 'dataMax + 6']} />
          <ReferenceLine
            x="NOW"
            stroke="var(--brand-accent)"
            strokeDasharray="2 4"
            strokeOpacity={0.75}
          />
          <Area
            type="monotone"
            dataKey="bandBase"
            stackId="band"
            stroke="none"
            fill="transparent"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="bandSize"
            stackId="band"
            stroke="none"
            fill="url(#sim-forecast-band)"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="color-mix(in oklch, var(--foreground), transparent 22%)"
            strokeWidth={1.6}
            dot={false}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={650}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="var(--brand-accent)"
            strokeWidth={1.6}
            strokeDasharray="5 4"
            dot={false}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
