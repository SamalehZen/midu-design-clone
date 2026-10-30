import React, { useEffect, useRef } from "react";
import { LOTTIE } from "./sleep-icon-data.js";

// Minimal faithful renderer for the original dotLottie asset: 3 path layers whose only
// animated property is scale. Keyframe interpolation uses Lottie's cubic-bezier easing.
function bezier(t, x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (u) => ((ax * u + bx) * u + cx) * u;
  const dfx = (u) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = fx(u) - t;
    if (Math.abs(x) < 1e-6) break;
    const d = dfx(u);
    if (Math.abs(d) < 1e-6) break;
    u -= x / d;
  }
  return ((ay * u + by) * u + cy) * u;
}

function scaleAt(layer, frame) {
  const kf = layer.kf;
  if (frame <= kf[0].t) return kf[0].s[0];
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i], b = kf[i + 1];
    if (frame >= a.t && frame <= b.t) {
      const p = (frame - a.t) / (b.t - a.t);
      const e = bezier(p, a.o[0], a.o[1], a.i[0], a.i[1]);
      return a.s[0] + (b.s[0] - a.s[0]) * e;
    }
  }
  return kf[kf.length - 1].s[0];
}

export function SleepIcon() {
  const refs = useRef([]);
  useEffect(() => {
    const t0 = performance.now();
    const dur = LOTTIE.op - LOTTIE.ip;
    let raf = 0;
    const tick = () => {
      const frame = ((performance.now() - t0) / 1000) * LOTTIE.fr;
      const f = LOTTIE.ip + (frame % dur);
      for (let i = 0; i < LOTTIE.layers.length; i++) {
        const g = refs.current[i];
        if (!g) continue;
        const L = LOTTIE.layers[i];
        const s = scaleAt(L, f) / 100;
        g.setAttribute(
          "transform",
          "translate(" + L.p[0] + " " + L.p[1] + ") scale(" + s + ") translate(" + -L.a[0] + " " + -L.a[1] + ")"
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg
      viewBox={"0 0 " + LOTTIE.w + " " + LOTTIE.h}
      width="14"
      height="14"
      style={{ display: "block", width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      {LOTTIE.layers.map((L, i) => (
        <g key={i} ref={(el) => (refs.current[i] = el)} opacity={L.opacity}>
          <path d={L.d} fill={L.fill} />
        </g>
      ))}
    </svg>
  );
}
